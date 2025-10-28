import Stripe from 'stripe'

const {
  STRIPE_API_KEY,
// eslint-disable-next-line node/prefer-global/process
} = process.env
export const stripeApiClient = new Stripe(STRIPE_API_KEY!)
