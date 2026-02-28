'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Car, DollarSign, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatPrice } from '@/lib/constants';
import { toast } from 'sonner';

const LOT_PRICES: Record<string, { name: string; price: number }> = {
  'lot-1': { name: 'Lot A - Stadium North', price: 4500 },
  'lot-2': { name: 'Lot B - Stadium East', price: 3500 },
  'lot-3': { name: 'Lot C - Assembly Hall', price: 2500 },
  'lot-4': { name: 'Lot D - Research Park', price: 2000 },
  'lot-5': { name: 'Lot E - State Farm Center', price: 2000 },
  'lot-6': { name: 'Lot F - ADA Accessible', price: 3000 },
};

function PayNowContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const lotId = searchParams.get('lot') || 'lot-3';

  const [licensePlate, setLicensePlate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const lotInfo = LOT_PRICES[lotId] || LOT_PRICES['lot-3'];

  const handlePayment = async () => {
    if (!licensePlate.trim()) {
      toast.error('Please enter a license plate');
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsProcessing(false);
    setIsComplete(true);

    // TODO: In production:
    // 1. Create reservation with payment_source: 'in_person'
    // 2. Update inventory
    // 3. Generate QR code (optional - can use plate for lookup)
  };

  if (isComplete) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-green-600 text-white p-6">
        <CheckCircle className="h-24 w-24 mb-6" />
        <h1 className="text-3xl font-bold mb-2">Payment Complete!</h1>
        <p className="text-lg text-green-100 mb-4">Vehicle admitted to lot</p>

        <Card className="bg-white/20 backdrop-blur border-0 w-full max-w-sm">
          <CardContent className="p-4 text-center">
            <Car className="h-8 w-8 mx-auto mb-2" />
            <p className="font-mono text-2xl font-bold">{licensePlate.toUpperCase()}</p>
            <p className="text-sm text-green-100">{lotInfo.name}</p>
          </CardContent>
        </Card>

        <Button
          variant="outline"
          size="lg"
          className="mt-8 bg-white text-green-700 hover:bg-green-50 border-0"
          onClick={() => {
            setIsComplete(false);
            setLicensePlate('');
          }}
        >
          Process Another
        </Button>

        <Button
          variant="ghost"
          className="mt-4 text-white hover:bg-green-700"
          onClick={() => router.push('/gate')}
        >
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-primary text-white p-4 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
          onClick={() => router.push('/gate')}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div>
          <h1 className="font-bold">Walk-up Payment</h1>
          <p className="text-sm text-white/70">Process on-site purchase</p>
        </div>
      </header>

      <main className="flex-1 p-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {lotInfo.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Price display */}
            <div className="bg-muted rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">Amount Due</p>
              <p className="text-4xl font-bold text-primary">
                {formatPrice(lotInfo.price)}
              </p>
            </div>

            {/* License plate */}
            <div className="space-y-2">
              <Label htmlFor="plate">License Plate</Label>
              <Input
                id="plate"
                placeholder="ABC1234"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                className="uppercase text-center text-xl font-mono"
                maxLength={10}
              />
            </div>

            {/* Payment method */}
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select
                value={paymentMethod}
                onValueChange={(v) => setPaymentMethod(v as 'card' | 'cash')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Process button */}
            <Button
              className="w-full h-14 text-lg bg-green-600 hover:bg-green-700"
              onClick={handlePayment}
              disabled={isProcessing || !licensePlate.trim()}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Complete Payment
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function PayNowPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }
    >
      <PayNowContent />
    </Suspense>
  );
}
