'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      setError('No session ID provided');
      return;
    }

    // In production, fetch the session details from the API
    // and get the reservation ID to redirect to the pass page
    // For demo, generate a fake reservation ID and redirect

    const reservationId = `res-${Date.now()}`;

    // Simulate fetching session metadata
    // In production: GET /api/checkout/session?id=${sessionId}

    // Redirect to pass page with demo data
    setTimeout(() => {
      router.replace(
        `/pass/${reservationId}?event=event-1&lot=lot-1&email=demo@example.com&plate=ABC1234`
      );
    }, 1500);
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Processing Your Order...</h1>
        <p className="text-muted-foreground">
          Please wait while we confirm your payment.
        </p>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
