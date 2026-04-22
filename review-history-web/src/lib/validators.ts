import { z } from 'zod';

// Relaxed UUID regex — accepts any hex UUID format (including non-RFC4122 legacy IDs)
const uuidLike = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

// Phone validation — Pakistan format
export const pakistaniPhoneRegex = /^(\+92|0)?3[0-9]{9}$/;

export const phoneSchema = z.object({
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(pakistaniPhoneRegex, 'Enter a valid Pakistani mobile number (03xx-xxxxxxx)'),
});
export type PhoneInput = z.infer<typeof phoneSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .max(255, 'Email must be at most 255 characters')
    .email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .max(255, 'Email must be at most 255 characters')
    .email('Enter a valid email'),
  phone: z
    .string()
    .trim()
    .min(1, 'Phone number is required')
    .max(13, 'Phone number must be at most 13 characters')
    .regex(pakistaniPhoneRegex, 'Enter a valid Pakistani mobile number (03xx-xxxxxxx)'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters'),
  acceptLegal: z.boolean().refine((v) => v === true, {
    message: 'You must accept Terms and Privacy Policy',
  }),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const otpSchema = z.object({
  code: z
    .string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d{6}$/, 'OTP must be numeric'),
});
export type OtpInput = z.infer<typeof otpSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .max(255, 'Email must be at most 255 characters')
    .email('Enter a valid email'),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    code: z
      .string()
      .length(6, 'OTP must be 6 digits')
      .regex(/^\d{6}$/, 'OTP must be numeric'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be at most 128 characters'),
    confirmPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be at most 128 characters'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const updateProfileSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  bio: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const createReviewSchema = z.object({
  rating: z.number().min(1, 'Rating is required').max(5),
  title: z.string().max(200).optional(),
  body: z.string().min(10, 'Review must be at least 10 characters').max(5000),
  isAnonymous: z.boolean().optional(),
});
export type CreateReviewInput = z.infer<typeof createReviewSchema>;

export const createEntitySchema = z.object({
  categoryKey: z.string().min(1, 'Category is required').max(50),
  displayName: z.string().min(2, 'Name must be at least 2 characters').max(200),
  cityId: z.string().regex(uuidLike, 'Select a city'),
  localityId: z.string().regex(uuidLike).optional().or(z.literal('')),
  phone: z
    .string()
    .max(20)
    .optional()
    .or(z.literal(''))
    .refine((value) => !value || pakistaniPhoneRegex.test(value), {
      message: 'Enter a valid Pakistani mobile number (03xx-xxxxxxx)',
    }),
  addressLine: z.string().max(300).optional().or(z.literal('')),
  landmark: z.string().max(200).optional().or(z.literal('')),
});
export type CreateEntityInput = z.infer<typeof createEntitySchema>;

export const searchSchema = z.object({
  q: z.string().max(200).optional(),
  categoryKey: z.string().max(50).optional(),
  cityId: z.string().regex(uuidLike).optional(),
  localityId: z.string().regex(uuidLike).optional(),
  sort: z.enum(['newest', 'rating', 'reviews', 'name']).optional(),
  page: z.number().optional(),
  pageSize: z.number().optional(),
});
export type SearchInput = z.infer<typeof searchSchema>;

export type PhoneFormData = z.infer<typeof phoneSchema>;
export type OtpFormData = z.infer<typeof otpSchema>;
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type CreateReviewFormData = z.infer<typeof createReviewSchema>;
export type CreateEntityFormData = z.infer<typeof createEntitySchema>;
export type SearchFormData = z.infer<typeof searchSchema>;
