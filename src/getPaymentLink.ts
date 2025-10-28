import type { PaymentOption } from '@/lib/model/PaymentOption.ts'
import type PricingConfiguration from '@/lib/model/PricingConfiguration.ts'
import { stripeApiClient } from '@/lib/api/stripeApiClient.ts'
import StripeService from '@/lib/service/StripeService.ts'

interface LambdaRequestBody {
  pricingConfig: PricingConfiguration
  installments: PaymentOption
}

export async function handler(event: { body: string }) {
  const body: LambdaRequestBody = JSON.parse(event.body)
  const stripeService = new StripeService(stripeApiClient)
  const paymentLinkUrl = await stripeService.createPaymentLink(
    body.pricingConfig,
    body.installments,
  )

  return {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Methods': 'POST',
    },
    body: { paymentLinkUrl },
  }
}
