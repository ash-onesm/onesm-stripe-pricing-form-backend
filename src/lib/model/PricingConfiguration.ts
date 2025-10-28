import type { CourseType } from '@/lib/model/CourseType.ts'

export default interface PricingConfiguration {
  courseType: CourseType
  tutoringHours: number
  aamcContent: boolean
  uworldContent: boolean
}
