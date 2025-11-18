import type PriceData from '@/lib/model/PriceData.ts'

const priceMocks: PriceData = {
  coursePrices: {
    comprehensiveCoursePrice: 2980,
    bootcampPrice: 2980,
  },
  tutoringHourPrices: [
    { hours: 0, hourlyRate: 255 },
    { hours: 10, hourlyRate: 235 },
    { hours: 20, hourlyRate: 225 },
    { hours: 30, hourlyRate: 215 },
    { hours: 40, hourlyRate: 195 },
    { hours: 50, hourlyRate: 185 },
    { hours: 60, hourlyRate: 175 },
  ],
  addonPrices: {
    premiumTutorPrice: 50,
    uworldContentPrice: 350,
    aamcContentPrice: 300,
  },
}

export default priceMocks
