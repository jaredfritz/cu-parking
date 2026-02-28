'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { EventForm } from '@/components/admin/event-form';
import { getEventById, type StoredEvent } from '@/lib/events-store';

export default function EditEventPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const [eventData, setEventData] = useState<StoredEvent | null | undefined>(undefined);

  useEffect(() => {
    getEventById(eventId).then(setEventData);
  }, [eventId]);

  if (eventData === undefined) {
    return <div className="p-6 text-center text-muted-foreground">Loading…</div>;
  }

  if (!eventData) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-2">Event Not Found</h1>
          <p className="text-muted-foreground">
            The event you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <EventForm initialData={eventData} isEditing />
    </div>
  );
}
