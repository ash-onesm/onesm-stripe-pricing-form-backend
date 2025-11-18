import { expect, test } from 'bun:test'
import StripeService from '@/lib/service/StripeService.ts'

test('comprehensive-aamc-uworld-onetime', () => {
  const stripeService = new StripeService(null!)

  const productName = stripeService.generateProductName({
    courseType: 'comprehensive-course',
    tutoringHours: 1,
    aamcContent: true,
    uworldContent: true,
    weeklyCheckIn: false,
  }, 0)

  expect(productName).toBe('Comprehensive MCAT Course with 1 Hours of 1-on-1 Tutoring (including AAMC and UWorld, One-time Payment)')
})

test('bootcamp-uworld-onetime', () => {
  const stripeService = new StripeService(null!)

  const productName = stripeService.generateProductName({
    courseType: 'bootcamp',
    tutoringHours: 1,
    aamcContent: false,
    uworldContent: true,
    weeklyCheckIn: false,
  }, 0)

  expect(productName).toBe('Winter Break MCAT Bootcamp with 1 Hours of 1-on-1 Tutoring (including UWorld, minus AAMC, One-time Payment)')
})

test('bootcamp-uworld-weeklycheckin-onetime', () => {
  const stripeService = new StripeService(null!)

  const productName = stripeService.generateProductName({
    courseType: 'bootcamp',
    tutoringHours: 0,
    aamcContent: false,
    uworldContent: true,
    weeklyCheckIn: true,
  }, 0)

  expect(productName).toBe('Winter Break MCAT Bootcamp with Weekly Check-Ins (including UWorld, minus AAMC, One-time Payment)')
})

test('plain-hours-aamc-onetime', () => {
  const stripeService = new StripeService(null!)

  const productName = stripeService.generateProductName({
    courseType: 'plain-hours',
    tutoringHours: 20,
    aamcContent: true,
    uworldContent: false,
    weeklyCheckIn: false,
  }, 0)

  expect(productName).toBe('20 Hours of 1-on-1 Tutoring (including AAMC, minus UWorld, One-time Payment)')
})

test('comprehensive-3installments', () => {
  const stripeService = new StripeService(null!)

  const productName = stripeService.generateProductName({
    courseType: 'comprehensive-course',
    tutoringHours: 1,
    aamcContent: false,
    uworldContent: false,
    weeklyCheckIn: false,
  }, 3)

  expect(productName).toBe('Comprehensive MCAT Course with 1 Hours of 1-on-1 Tutoring (minus AAMC and UWorld, 3 installments)')
})

test('admissions-onetime', () => {
  const stripeService = new StripeService(null!)

  const productName = stripeService.generateProductName({
    courseType: 'admissions',
    tutoringHours: 10,
    aamcContent: false,
    uworldContent: false,
    weeklyCheckIn: false,
  }, 0)

  expect(productName).toBe('10 Hours of Medical School Admissions Advising (One-time Payment)')
})

test('admissions-2installments', () => {
  const stripeService = new StripeService(null!)

  const productName = stripeService.generateProductName({
    courseType: 'admissions',
    tutoringHours: 10,
    aamcContent: false,
    uworldContent: false,
    weeklyCheckIn: false,
  }, 2)

  expect(productName).toBe('10 Hours of Medical School Admissions Advising (2 installments)')
})
