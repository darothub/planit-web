import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const registerSchema = z.object({
  firstName: z.string().min(1, 'Required').max(100, 'Too long'),
  lastName:  z.string().min(1, 'Required').max(100, 'Too long'),
  email:     z.string().email('Enter a valid email'),
  password:  z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
  businessName: z.string().max(255).optional(),
})

export type LoginValues    = z.infer<typeof loginSchema>
export type RegisterValues = z.infer<typeof registerSchema>