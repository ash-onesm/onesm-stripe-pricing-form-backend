export enum PaymentOption {
  OneTime = 'one-time',
  TwoMonths = 'two-months',
  ThreeMonths = 'three-months',
  FourMonths = 'four-months',
  FiveMonths = 'five-months',
  SixMonths = 'six-months',
}

export function paymentOptionToNumber(paymentOption: PaymentOption): number {
  switch (paymentOption) {
    case PaymentOption.OneTime:
      return 0
    case PaymentOption.TwoMonths:
      return 2
    case PaymentOption.ThreeMonths:
      return 3
    case PaymentOption.FourMonths:
      return 4
    case PaymentOption.FiveMonths:
      return 5
    case PaymentOption.SixMonths:
      return 6
    default:
      return 0
  }
}
