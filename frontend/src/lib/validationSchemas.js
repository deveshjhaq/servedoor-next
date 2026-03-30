import { z } from 'zod';

export const phoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number');

export const emailSchema = z
  .string()
  .email('Enter a valid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters');

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const otpLoginSchema = z.object({
  phone: phoneSchema,
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: phoneSchema,
  email: emailSchema.optional().or(z.literal('')),
  password: passwordSchema,
});

export const otpRegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: phoneSchema,
  email: emailSchema.optional().or(z.literal('')),
});

export const addressSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  street: z.string().min(5, 'Street is too short'),
  city: z.string().min(2, 'City is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
});

export const couponSchema = z.object({
  code: z
    .string()
    .min(3, 'Coupon code is too short')
    .max(20, 'Coupon code is too long')
    .transform((v) => v.toUpperCase()),
});
