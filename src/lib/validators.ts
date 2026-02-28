import { z } from 'zod';

// Checkout form validation
export const checkoutFormSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[\d\s\-\(\)\+]+$/.test(val),
      'Please enter a valid phone number'
    ),
  license_plate: z
    .string()
    .max(10, 'License plate is too long')
    .transform((val) => val.toUpperCase().replace(/[^A-Z0-9]/g, ''))
    .optional(),
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

// Event form validation (admin)
export const eventFormSchema = z.object({
  name: z.string().min(1, 'Event name is required'),
  event_date: z.string().min(1, 'Event date is required'),
  event_time: z.string().min(1, 'Event time is required'),
  property_id: z.string().min(1, 'Property is required'),
  presale_cutoff: z.string().optional(),
  in_person_enabled: z.boolean().default(true),
  is_published: z.boolean().default(false),
  lot_ids: z.array(z.string()).min(1, 'At least one lot is required'),
  image_url: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
});

export type EventFormValues = z.infer<typeof eventFormSchema>;

// Lot form validation (admin)
export const lotFormSchema = z.object({
  name: z.string().min(1, 'Lot name is required'),
  property_id: z.string().min(1, 'Property is required'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  price_cents: z.number().min(0, 'Price cannot be negative'),
  badges: z.array(z.string()).default([]),
  walking_time_minutes: z.number().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  description: z.string().optional(),
});

export type LotFormValues = z.infer<typeof lotFormSchema>;

// Scan validation (gate agent)
export const scanSchema = z.object({
  qr_code: z.string().min(1, 'QR code is required'),
  lot_id: z.string().min(1, 'Lot ID is required'),
  agent_id: z.string().optional(),
});

export type ScanValues = z.infer<typeof scanSchema>;

// Lookup validation (gate agent)
export const lookupSchema = z.object({
  event_id: z.string().min(1, 'Event ID is required'),
  lot_id: z.string().optional(),
  query: z.string().min(1, 'Search query is required'),
});

export type LookupValues = z.infer<typeof lookupSchema>;
