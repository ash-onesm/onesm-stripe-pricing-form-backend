import type PriceData from '@/lib/model/PriceData.ts'

const priceMocks: PriceData = {
  coursePrices: {
    comprehensiveCoursePrice: 2500,
    bootcampPrice: 2980,
  },
  tutoringHourPrices: [
    { hours: 0, hourlyRate: 195 },
    { hours: 10, hourlyRate: 180 },
    { hours: 20, hourlyRate: 165 },
    { hours: 30, hourlyRate: 153.33 },
    { hours: 40, hourlyRate: 145 },
    { hours: 50, hourlyRate: 140 },
    { hours: 60, hourlyRate: 135 },
  ],
  addonPrices: {
    premiumTutorPrice: 50,
    uworldContentPrice: 300,
    aamcContentPrice: 300,
  },
}

export default priceMocks
