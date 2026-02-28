'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatEventDate, formatEventTime } from '@/lib/constants';
import { getEvents, updateEvent, deleteEvent, eventName, type StoredEvent } from '@/lib/events-store';
import { toast } from 'sonner';

export default function EventsPage() {
  const [events, setEvents] = useState<StoredEvent[]>([]);

  const refresh = async () => setEvents(await getEvents());

  useEffect(() => { refresh(); }, []);

  const togglePublished = async (eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return;
    await updateEvent(eventId, { isPublished: !event.isPublished });
    await refresh();
    toast.success('Event status updated');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="text-muted-foreground">
            Manage your events and parking availability
          </p>
        </div>
        <Link href="/admin/events/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </Link>
      </div>

      {/* Events Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            2026 Season
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{eventName(event)}</p>
                      {event.description && (
                        <p className="text-sm text-muted-foreground">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{formatEventDate(event.date)}</p>
                      <p className="text-muted-foreground">
                        {formatEventTime(event.time)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {event.isAway ? (
                      <Badge variant="outline">Away</Badge>
                    ) : event.isBye ? (
                      <Badge variant="outline">Bye</Badge>
                    ) : event.isPublished ? (
                      <Badge className="bg-green-100 text-green-800">
                        Published
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/events/${event.id}`}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit Event
                          </Link>
                        </DropdownMenuItem>
                        {!event.isAway && !event.isBye && (
                          <DropdownMenuItem
                            onClick={() => togglePublished(event.id)}
                          >
                            {event.isPublished ? (
                              <>
                                <ToggleLeft className="h-4 w-4 mr-2" />
                                Unpublish
                              </>
                            ) : (
                              <>
                                <ToggleRight className="h-4 w-4 mr-2" />
                                Publish
                              </>
                            )}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={async () => {
                            const name = eventName(event);
                            await deleteEvent(event.id);
                            await refresh();
                            toast.success(`"${name}" deleted`);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
