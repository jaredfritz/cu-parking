'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getLots, type AdminLot } from '@/lib/lots-store';
import { LotForm } from '@/components/admin/lot-form';
import Link from 'next/link';

export default function EditLotPage() {
  const params = useParams();
  const lotId = params.lotId as string;
  const [lot, setLot] = useState<AdminLot | null | undefined>(undefined);

  useEffect(() => {
    getLots().then((lots) => setLot(lots.find((l) => l.id === lotId) ?? null));
  }, [lotId]);

  if (lot === undefined) {
    return <div className="p-6 text-center text-muted-foreground">Loading…</div>;
  }

  if (!lot) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground mb-4">Lot not found.</p>
        <Link href="/admin/lots" className="text-primary hover:underline text-sm">
          ← Back to Lots
        </Link>
      </div>
    );
  }

  return <LotForm initialData={lot} isEditing />;
}
