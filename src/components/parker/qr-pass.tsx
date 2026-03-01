'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Calendar, Clock, MapPin, Car, Download, Share2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { generateQRCode, generateQRPayload } from '@/lib/qr/generate';
import { formatEventDate, formatEventTime } from '@/lib/constants';

interface QRPassProps {
  reservationId: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  lotName: string;
  licensePlate: string;
  email: string;
}

export function QRPass({
  reservationId,
  eventName,
  eventDate,
  eventTime,
  lotName,
  licensePlate,
  email,
}: QRPassProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [qrPayload, setQrPayload] = useState<string>('');

  useEffect(() => {
    const payload = generateQRPayload(reservationId);
    setQrPayload(payload);

    generateQRCode(payload).then(setQrCodeUrl);
  }, [reservationId]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Parking Pass - ${eventName}`,
          text: `My parking pass for ${eventName} at ${lotName}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    }
  };

  return (
    <Card className="max-w-md mx-auto overflow-hidden">
      {/* Header */}
      <div className="bg-primary text-white p-6 text-center">
        <h1 className="text-2xl font-bold mb-1">Parking Pass</h1>
        <p className="text-white/70">CU Parking</p>
      </div>

      <CardContent className="p-6">
        {/* QR Code */}
        <div className="flex justify-center mb-6">
          <div className="bg-white p-4 rounded-lg shadow-inner border">
            {qrCodeUrl ? (
              <Image
                src={qrCodeUrl}
                alt="QR Code"
                width={200}
                height={200}
                className="mx-auto"
              />
            ) : (
              <div className="w-[200px] h-[200px] bg-muted animate-pulse rounded" />
            )}
          </div>
        </div>

        {/* Scan instruction */}
        <p className="text-center text-sm text-muted-foreground mb-6">
          Show this QR code to the gate attendant
        </p>

        <Separator className="my-6" />

        {/* Event Details */}
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Event</p>
            <p className="font-semibold text-lg">{eventName}</p>
          </div>

          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{formatEventDate(eventDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{formatEventTime(eventTime)}</span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">{lotName}</p>
              <p className="text-sm text-muted-foreground">Gies Memorial Stadium, Champaign</p>
            </div>
          </div>

          <Separator />

          {/* License Plate */}
          <div className="flex items-center gap-2">
            <Car className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">License Plate</p>
              <p className="font-mono font-bold text-lg">{licensePlate}</p>
            </div>
          </div>

          {/* Confirmation */}
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Confirmation sent to</p>
            <p className="text-sm font-medium truncate">{email}</p>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Add to Wallet
          </Button>
        </div>

        {/* Confirmation ID */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Confirmation: {reservationId}
        </p>
      </CardContent>
    </Card>
  );
}
