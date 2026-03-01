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
  Check,
  X,
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
import { Switch } from '@/components/ui/switch';
import { formatEventDate, formatEventTime } from '@/lib/constants';
import { getEvents, updateEvent, deleteEvent, eventName, type StoredEvent } from '@/lib/events-store';
import { toast } from 'sonner';

type EventDraft = {
  opponent: string;
  description: string;
  date: string;
  time: string;
  isPublished: boolean;
};

export default function EventsPage() {
  const [events, setEvents] = useState<StoredEvent[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, EventDraft>>({});
  const [saving, setSaving] = useState(false);

  const refresh = async () => setEvents(await getEvents());

  useEffect(() => { refresh(); }, []);

  const togglePublished = async (eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return;
    await updateEvent(eventId, { isPublished: !event.isPublished });
    await refresh();
    toast.success('Event status updated');
  };

  const enterEditMode = () => {
    const initial: Record<string, EventDraft> = {};
    for (const e of events) {
      initial[e.id] = {
        opponent: e.opponent,
        description: e.description,
        date: e.date,
        time: e.time,
        isPublished: e.isPublished,
      };
    }
    setDrafts(initial);
    setEditMode(true);
  };

  const cancelEditMode = () => {
    setDrafts({});
    setEditMode(false);
  };

  const setDraft = (id: string, patch: Partial<EventDraft>) => {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      await Promise.all(
        events.map((e) => updateEvent(e.id, drafts[e.id]))
      );
      await refresh();
      setEditMode(false);
      setDrafts({});
      toast.success('All events saved');
    } catch {
      toast.error('Failed to save events');
    } finally {
      setSaving(false);
    }
  };

  const cellInput = (cls = '') =>
    `border border-input rounded px-2 py-1 text-sm bg-background w-full ${cls}`;

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
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[120px] text-right">
                  {editMode ? (
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-muted-foreground"
                        onClick={cancelEditMode}
                        disabled={saving}
                      >
                        <X className="h-3.5 w-3.5 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="h-7 px-2"
                        onClick={saveAll}
                        disabled={saving}
                      >
                        <Check className="h-3.5 w-3.5 mr-1" />
                        {saving ? 'Saving…' : 'Save'}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs"
                        onClick={enterEditMode}
                      >
                        <Pencil className="h-3 w-3 mr-1" />
                        Edit all
                      </Button>
                    </div>
                  )}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => {
                const draft = drafts[event.id];
                const timeTBD = draft?.time === 'TBD';
                return (
                  <TableRow key={event.id} className={editMode ? 'align-top' : ''}>
                    {/* Event name */}
                    <TableCell className="font-medium whitespace-nowrap">
                      {editMode ? (
                        <input
                          className={cellInput('min-w-[160px]')}
                          value={draft.opponent}
                          onChange={(e) => setDraft(event.id, { opponent: e.target.value })}
                          placeholder="Opponent"
                        />
                      ) : (
                        eventName(event)
                      )}
                    </TableCell>

                    {/* Description */}
                    <TableCell>
                      {editMode ? (
                        <input
                          className={cellInput('min-w-[160px]')}
                          value={draft.description}
                          onChange={(e) => setDraft(event.id, { description: e.target.value })}
                          placeholder="e.g. Homecoming"
                        />
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {event.description || <span className="text-muted-foreground/40">—</span>}
                        </span>
                      )}
                    </TableCell>

                    {/* Date */}
                    <TableCell>
                      {editMode ? (
                        <input
                          type="date"
                          className={cellInput('w-36')}
                          value={draft.date}
                          onChange={(e) => setDraft(event.id, { date: e.target.value })}
                        />
                      ) : (
                        <span className="text-sm whitespace-nowrap">{formatEventDate(event.date)}</span>
                      )}
                    </TableCell>

                    {/* Time */}
                    <TableCell>
                      {editMode ? (
                        <div className="space-y-1.5">
                          {!timeTBD && (
                            <input
                              type="time"
                              className={cellInput('w-28')}
                              value={draft.time}
                              onChange={(e) => setDraft(event.id, { time: e.target.value })}
                            />
                          )}
                          <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={timeTBD}
                              onChange={(e) =>
                                setDraft(event.id, { time: e.target.checked ? 'TBD' : '12:00' })
                              }
                              className="rounded"
                            />
                            TBD
                          </label>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground whitespace-nowrap">{formatEventTime(event.time)}</span>
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      {editMode ? (
                        <div className="flex items-center gap-2 pt-1">
                          <Switch
                            checked={draft.isPublished}
                            onCheckedChange={(v) => setDraft(event.id, { isPublished: v })}
                          />
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {draft.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </div>
                      ) : event.isPublished ? (
                        <Badge className="bg-green-100 text-green-800">Published</Badge>
                      ) : (
                        <Badge variant="secondary">Draft</Badge>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      {!editMode && (
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
                            <DropdownMenuItem onClick={() => togglePublished(event.id)}>
                              {event.isPublished ? (
                                <><ToggleLeft className="h-4 w-4 mr-2" />Unpublish</>
                              ) : (
                                <><ToggleRight className="h-4 w-4 mr-2" />Publish</>
                              )}
                            </DropdownMenuItem>
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
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
