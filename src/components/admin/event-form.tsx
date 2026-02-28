'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, Save, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import Link from 'next/link';
import { getLots, type AdminLot } from '@/lib/lots-store';
import { addEvent, updateEvent } from '@/lib/events-store';

interface EventFormData {
  id?: string;
  name: string;
  opponent: string;
  date: string;
  time: string;
  description: string;
  isPublished: boolean;
}

interface EventFormProps {
  initialData?: Partial<EventFormData>;
  isEditing?: boolean;
}

export function EventForm({ initialData, isEditing = false }: EventFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allLots, setAllLots] = useState<AdminLot[]>([]);
  const [selectedLots, setSelectedLots] = useState<string[]>([]);

  useEffect(() => {
    getLots().then((lots) => {
      setAllLots(lots);
      if (isEditing) setSelectedLots(lots.map((l) => l.id));
    });
  }, [isEditing]);

  const [formData, setFormData] = useState<EventFormData>({
    id: initialData?.id,
    name: initialData?.name || '',
    opponent: initialData?.opponent || '',
    date: initialData?.date || '',
    time: initialData?.time || '12:00',
    description: initialData?.description || '',
    isPublished: initialData?.isPublished ?? false,
  });
  const [timeTBD, setTimeTBD] = useState(initialData?.time === 'TBD');

  const handleChange = (
    field: keyof EventFormData,
    value: string | boolean | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleLot = (lotId: string) => {
    setSelectedLots((prev) =>
      prev.includes(lotId)
        ? prev.filter((id) => id !== lotId)
        : [...prev, lotId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.opponent || !formData.date || !formData.time) {
      toast.error('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }

    if (selectedLots.length === 0) {
      toast.error('Please select at least one parking lot');
      setIsSubmitting(false);
      return;
    }

    const displayName = formData.opponent.startsWith('at ')
      ? `Illinois @ ${formData.opponent.replace('at ', '')}`
      : `Illinois vs. ${formData.opponent}`;

    const eventData = {
      opponent: formData.opponent,
      date: formData.date,
      time: formData.time,
      description: formData.description,
      isPublished: formData.isPublished,
      isAway: false,
      isBye: false,
    };

    try {
      if (isEditing && formData.id) {
        await updateEvent(formData.id, eventData);
        toast.success(`"${displayName}" updated`);
      } else {
        await addEvent(eventData);
        toast.success(`"${displayName}" created`);
      }
      router.push('/admin/events');
    } catch {
      toast.error('Something went wrong');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/events">
            <Button type="button" variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">
              {isEditing ? 'Edit Event' : 'Create Event'}
            </h1>
            <p className="text-muted-foreground">
              {isEditing
                ? 'Update event details and lot assignments'
                : 'Add a new event to your calendar'}
            </p>
          </div>
        </div>
        <Button type="submit" disabled={isSubmitting}>
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Event' : 'Create Event'}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Event Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="opponent">Opponent *</Label>
                  <Input
                    id="opponent"
                    placeholder="e.g., Ohio State"
                    value={formData.opponent}
                    onChange={(e) => handleChange('opponent', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Event will be named &quot;Illinois vs. [Opponent]&quot;
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description / Notes</Label>
                  <Input
                    id="description"
                    placeholder="e.g., Homecoming, Senior Day"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date">Event Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleChange('date', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="time">Kickoff Time *</Label>
                    <label className="flex items-center gap-1.5 text-sm text-muted-foreground cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={timeTBD}
                        onChange={(e) => {
                          setTimeTBD(e.target.checked);
                          handleChange('time', e.target.checked ? 'TBD' : '12:00');
                        }}
                        className="rounded"
                      />
                      TBD
                    </label>
                  </div>
                  {!timeTBD && (
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => handleChange('time', e.target.value)}
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lot Assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Parking Lot Assignment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Select which lots will be available for this event. You can customize pricing per lot.
              </p>
              <div className="space-y-3">
                {allLots.map((lot) => {
                  const isSelected = selectedLots.includes(lot.id);
                  return (
                    <div
                      key={lot.id}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => toggleLot(lot.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={isSelected}
                          onCheckedChange={() => toggleLot(lot.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div>
                          <p className="font-medium">{lot.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {lot.address} · {lot.capacity} spots
                          </p>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="text-sm text-muted-foreground">
                          Using default pricing
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {selectedLots.length === 0 && (
                <p className="text-sm text-red-600 mt-2">
                  Please select at least one lot
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publishing */}
          <Card>
            <CardHeader>
              <CardTitle>Publishing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Published</p>
                  <p className="text-sm text-muted-foreground">
                    Make visible to customers
                  </p>
                </div>
                <Switch
                  checked={formData.isPublished}
                  onCheckedChange={(checked) => handleChange('isPublished', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Selected Lots</span>
                <span className="font-medium">{selectedLots.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Capacity</span>
                <span className="font-medium">
                  {allLots.filter((l) => selectedLots.includes(l.id))
                    .reduce((sum, l) => sum + l.capacity, 0)}{' '}
                  spots
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium">
                  {formData.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
