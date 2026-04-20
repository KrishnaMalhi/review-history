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
  email: z.string().email('Enter a valid email').max(255),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Enter a valid email').max(255),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .max(20)
    .regex(pakistaniPhoneRegex, 'Enter a valid Pakistani mobile number (03xx-xxxxxxx)'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const otpSchema = z.object({
  code: z
    .string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d{6}$/, 'OTP must be numeric'),
});
export type OtpInput = z.infer<typeof otpSchema>;

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
