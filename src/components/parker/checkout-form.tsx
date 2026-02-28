'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, CreditCard, Mail, Phone, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { checkoutFormSchema, type CheckoutFormValues } from '@/lib/validators';

interface CheckoutFormProps {
  eventId: string;
  lotId: string;
  price: number;
  onSubmit: (data: CheckoutFormValues) => Promise<void>;
}

export function CheckoutForm({ eventId, lotId, price, onSubmit }: CheckoutFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      email: '',
      phone: '',
      license_plate: '',
    },
  });

  const handleSubmit = async (data: CheckoutFormValues) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                We&apos;ll send your parking pass to this email
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number
                <span className="text-muted-foreground font-normal">(optional)</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="(555) 123-4567"
                  autoComplete="tel"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Receive SMS reminders before the event
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="license_plate"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Car className="h-4 w-4" />
                License Plate
                <span className="text-muted-foreground font-normal">(optional)</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="ABC1234"
                  autoCapitalize="characters"
                  autoComplete="off"
                  className="uppercase"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e.target.value.toUpperCase());
                  }}
                />
              </FormControl>
              <FormDescription>
                Used as a backup access method at the gate
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-4 border-t">
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Pay ${(price / 100).toFixed(2)}
              </>
            )}
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-4">
            Secure checkout powered by Stripe. Apple Pay & Google Pay accepted.
          </p>
        </div>
      </form>
    </Form>
  );
}
