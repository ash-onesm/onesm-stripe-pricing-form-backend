export default interface PriceData {
  coursePrices: {
    comprehensiveCoursePrice: number
    bootcampPrice: number
  }
  tutoringHourPrices: {
    hours: number
    hourlyRate: number
  }[]
  addonPrices: {
    premiumTutorPrice: number
    uworldContentPrice: number
    aamcContentPrice: number
    weeklyCheckInPrice: number
  }
}
