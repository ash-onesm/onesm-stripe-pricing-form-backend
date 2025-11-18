import type Stripe from 'stripe'
import type { PaymentOption } from '@/lib/model/PaymentOption.ts'
import type PricingConfiguration from '@/lib/model/PricingConfiguration.ts'
import { paymentOptionToNumber } from '@/lib/model/PaymentOption.ts'
import pricesMock from '@/lib/prices.mock.ts'
import PriceService from '@/lib/service/PriceService.ts'
import { round } from '@/lib/utils.ts'

class StripeService {
  private stripe: Stripe

  constructor(stripeApiClient: Stripe) {
    this.stripe = stripeApiClient
  }

  generateProductName(pricingConfig: PricingConfiguration, installment: number) {
    const productName = []

    if (pricingConfig.courseType === 'admissions') {
      const name = `${pricingConfig.tutoringHours} Hours of Medical School Admissions Advising`
      if (installment === 0) { // we should never have 1, it should be 0 installments or 2 installments
        return `${name} (One-time Payment)`
      }
      else {
        return `${name} (${installment} installments)`
      }
    }

    if (pricingConfig.courseType === 'comprehensive-course') {
      productName.push('Comprehensive MCAT Course')
    }
    else if (pricingConfig.courseType === 'bootcamp') {
      productName.push('Winter Break MCAT Bootcamp')
    }

    if (pricingConfig.weeklyCheckIn) {
      productName.push('with Weekly Check-Ins')
    }

    if (pricingConfig.tutoringHours > 0) {
      if (pricingConfig.courseType !== 'plain-hours') {
        productName.push('with')
      }
      productName.push(`${pricingConfig.tutoringHours} Hours of 1-on-1 Tutoring`)
    }

    if (pricingConfig.aamcContent && pricingConfig.uworldContent) {
      productName.push('(including AAMC and UWorld,')
    }
    else if (pricingConfig.aamcContent) {
      productName.push('(including AAMC, minus UWorld,')
    }
    else if (pricingConfig.uworldContent) {
      productName.push('(including UWorld, minus AAMC,')
    }
    else {
      productName.push('(minus AAMC and UWorld,')
    }

    if (installment === 0) { // we should never have 1, it should be 0 installments or 2 installments
      productName.push('One-time Payment)')
    }
    else {
      productName.push(`${installment} installments)`)
    }

    return productName.join(' ')
  }

  generateMetadata(pricingConfig: PricingConfiguration, installments: number): Stripe.MetadataParam {
    const totalPrice = PriceService.priceCalculator(pricesMock, pricingConfig)
    return {
      comprehensive: pricingConfig.courseType === 'comprehensive-course' ? 'Yes' : 'No',
      bootcamp: pricingConfig.courseType === 'bootcamp' ? 'Yes' : 'No',
      aamc: pricingConfig.aamcContent ? 'Yes' : 'No',
      uworld: pricingConfig.uworldContent ? 'Yes' : 'No',
      weekly_check_in: pricingConfig.weeklyCheckIn ? 'Yes' : 'No',
      tutoring_hours: pricingConfig.tutoringHours,
      premium_tutor: 'No',
      installment_intervals: installments > 1 ? 'month' : '1',
      installment_frequency: 1,
      installment_number: Math.max(installments, 1),
      total_price: totalPrice,
      installment_amount: installments === 0 ? totalPrice : round(totalPrice / installments, 2),
    }
  }

  async createProduct(
    productName: string,
    pricingConfig: PricingConfiguration,
    installments: number,
  ): Promise<{ productId: string, newlyCreated: boolean }> {
    // Return an existing Product
    const comprehensive = pricingConfig.courseType === 'comprehensive-course' ? 'Yes' : 'No'
    const bootcamp = pricingConfig.courseType === 'bootcamp' ? 'Yes' : 'No'
    const existingProducts = await this.stripe.products.search({
      query: `name:"${productName}" AND active:'true' AND metadata["comprehensive"]:"${comprehensive}" AND metadata["bootcamp"]:"${bootcamp}"`,
      limit: 1,
    })

    if (existingProducts.data.length > 0) {
      return { productId: existingProducts.data[0]!.id, newlyCreated: false }
    }

    // Create a new Product
    const product = await this.stripe.products.create({
      name: productName,
      metadata: this.generateMetadata(pricingConfig, installments),
      images: [
        'https://i.imgur.com/7hwmtxD.png',
      ],
    })

    return { productId: product.id, newlyCreated: true }
  }

  async createPrice(productId: string, pricingConfig: PricingConfiguration, installments: number): Promise<string> {
    // Calculate the new unit_amount
    const totalPrice = PriceService.priceCalculator(pricesMock, pricingConfig)
    const newUnitAmount = installments === 0
      ? round(totalPrice * 100, 0)
      : round((totalPrice / installments) * 100, 0)

    // Search for all existing Prices for the productId
    const existingPrices = await this.stripe.prices.search({
      query: `product:"${productId}" AND active:'true'`,
    })

    // Filter to find a price with matching unit_amount
    const matchingPrice = existingPrices.data.find(price => price.unit_amount === newUnitAmount)
    if (matchingPrice) {
      return matchingPrice.id
    }

    // Create a new Price for the productId
    const priceParams: Stripe.PriceCreateParams = {
      product: productId,
      currency: 'usd',
      unit_amount: newUnitAmount,
    }

    if (installments !== 0) {
      priceParams.recurring = {
        interval: 'month',
        interval_count: 1,
      }
    }

    const price = await this.stripe.prices.create(priceParams)
    return price.id
  }

  async createPaymentLink(pricingConfig: PricingConfiguration, installments: PaymentOption): Promise<string | null> {
    const installmentsQty = paymentOptionToNumber(installments)

    const productName = this.generateProductName(pricingConfig, installmentsQty)
    const { productId } = await this.createProduct(productName, pricingConfig, installmentsQty)
    const priceId = await this.createPrice(productId, pricingConfig, installmentsQty)

    // if (newlyCreated) {
    let submitMessage = 'By clicking Subscribe you agree to pay for the selected plan'
    if (installmentsQty !== 0) {
      submitMessage += ` in ${installmentsQty} monthly installments`
    }

    // Create a new Payment Link
    const paymentLinkOptions: Stripe.PaymentLinkCreateParams = {
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      billing_address_collection: 'required',
      phone_number_collection: { enabled: true },
      consent_collection: { terms_of_service: 'required' },

      allow_promotion_codes: true,

      after_completion: {
        type: 'redirect',
        redirect: { url: 'https://mcat.live/automated-sign-up-1d52sa56f556af6sada13e5' },
      },

      custom_fields: [
        {
          key: 'student_name',
          label: {
            custom: 'Student Name',
            type: 'custom',
          },
          type: 'text',
        },
        {
          key: 'student_email',
          label: {
            custom: 'Student Email',
            type: 'custom',
          },
          type: 'text',
        },
      ],

      custom_text: {
        submit: {
          message: submitMessage,
        },
      },
      metadata: {
        title: productName,
        ...this.generateMetadata(pricingConfig, installmentsQty),
      },
    }
    if (installmentsQty === 0) {
      paymentLinkOptions.customer_creation = 'always'
      paymentLinkOptions.payment_intent_data = {
        setup_future_usage: 'off_session',
      }
    }
    const paymentLink = await this.stripe.paymentLinks.create(paymentLinkOptions)

    return paymentLink.url
    // }
    // else {
    //   // Get the payment link
    //   const paymentLinks = await this.stripe.paymentLinks.list({
    //     active: true,
    //     limit: 100,
    //     expand: ['data.line_items'],
    //   })
    //
    //   const existingLink = paymentLinks.data.find(link =>
    //     link.line_items?.data.some(item => item.price?.id === priceId)
    //     && link.active,
    //   )
    //
    //   return existingLink?.url ?? null
    // }
  }
}

export default StripeService
