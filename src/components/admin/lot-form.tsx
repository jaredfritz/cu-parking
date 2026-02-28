'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, X, Plus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { addLot, updateLot, type AdminLot, DEFAULT_THINGS_TO_KNOW } from '@/lib/lots-store';
import { BADGE_CONFIG, formatPrice } from '@/lib/constants';
import { toast } from 'sonner';

interface LotFormProps {
  initialData?: AdminLot;
  isEditing?: boolean;
}

const ALL_BADGES = Object.keys(BADGE_CONFIG) as (keyof typeof BADGE_CONFIG)[];

export function LotForm({ initialData, isEditing = false }: LotFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(initialData?.name ?? '');
  const [address, setAddress] = useState(initialData?.address ?? '');
  const [capacity, setCapacity] = useState(String(initialData?.capacity ?? ''));
  const [priceDollars, setPriceDollars] = useState(
    initialData ? String(initialData.price_cents / 100) : ''
  );
  const [walkTime, setWalkTime] = useState(String(initialData?.walking_time_minutes ?? ''));
  const [distance, setDistance] = useState(String(initialData?.distance_miles ?? ''));
  const [lat, setLat] = useState(String(initialData?.lat ?? ''));
  const [lng, setLng] = useState(String(initialData?.lng ?? ''));
  const [badges, setBadges] = useState<string[]>(initialData?.badges ?? []);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [isThirdParty, setIsThirdParty] = useState(initialData?.isThirdParty ?? false);
  const [inPersonEnabled, setInPersonEnabled] = useState(initialData?.inPersonEnabled ?? true);
  const [gatesOpenHours, setGatesOpenHours] = useState(String(initialData?.gatesOpenHours ?? '3'));
  const [presaleCutoffHours, setPresaleCutoffHours] = useState(String(initialData?.presaleCutoffHours ?? '2'));
  const [thingsToKnow, setThingsToKnow] = useState<string[]>(
    initialData?.thingsToKnow ?? DEFAULT_THINGS_TO_KNOW
  );

  const toggleBadge = (badge: string) => {
    setBadges((prev) =>
      prev.includes(badge) ? prev.filter((b) => b !== badge) : [...prev, badge]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Lot name is required');
      return;
    }

    setSaving(true);
    try {
      const data = {
        name: name.trim(),
        address: address.trim(),
        capacity: parseInt(capacity) || 0,
        price_cents: Math.round(parseFloat(priceDollars || '0') * 100),
        walking_time_minutes: parseInt(walkTime) || 0,
        distance_miles: parseFloat(distance) || 0,
        lat: parseFloat(lat) || 0,
        lng: parseFloat(lng) || 0,
        badges,
        isActive,
        isThirdParty,
        inPersonEnabled,
        gatesOpenHours: parseInt(gatesOpenHours) || 3,
        presaleCutoffHours: parseInt(presaleCutoffHours) || 2,
        thingsToKnow,
      };

      if (isEditing && initialData) {
        await updateLot(initialData.id, data);
        toast.success('Lot updated');
      } else {
        await addLot(data);
        toast.success('Lot created');
      }

      router.push('/admin/lots');
    } catch {
      toast.error('Something went wrong');
      setSaving(false);
    }
  };

  const priceCents = Math.round(parseFloat(priceDollars || '0') * 100);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/lots" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back to Lots
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{isEditing ? 'Edit Lot' : 'Add New Lot'}</h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Update lot details and pricing' : 'Create a new parking lot'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: main fields */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic info */}
            <Card>
              <CardHeader>
                <CardTitle>Lot Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Lot Name *</Label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Trade Center North"
                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <input
                    id="address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 115 W Kirby Ave, Champaign, IL"
                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="capacity">Capacity (spots)</Label>
                    <input
                      id="capacity"
                      type="number"
                      min="0"
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                      placeholder="200"
                      className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Price (dollars)</Label>
                    <input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={priceDollars}
                      onChange={(e) => setPriceDollars(e.target.value)}
                      placeholder="20.00"
                      className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="walkTime">Walk Time (minutes)</Label>
                    <input
                      id="walkTime"
                      type="number"
                      min="0"
                      value={walkTime}
                      onChange={(e) => setWalkTime(e.target.value)}
                      placeholder="18"
                      className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <Label htmlFor="distance">Distance (miles)</Label>
                    <input
                      id="distance"
                      type="number"
                      min="0"
                      step="0.1"
                      value={distance}
                      onChange={(e) => setDistance(e.target.value)}
                      placeholder="0.9"
                      className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map coordinates */}
            <Card>
              <CardHeader>
                <CardTitle>Map Pin (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lat">Latitude</Label>
                    <input
                      id="lat"
                      type="number"
                      step="any"
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      placeholder="40.0992"
                      className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lng">Longitude</Label>
                    <input
                      id="lng"
                      type="number"
                      step="any"
                      value={lng}
                      onChange={(e) => setLng(e.target.value)}
                      placeholder="-88.2360"
                      className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Badges */}
            <Card>
              <CardHeader>
                <CardTitle>Feature Badges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {ALL_BADGES.map((badge) => {
                    const config = BADGE_CONFIG[badge];
                    const selected = badges.includes(badge);
                    return (
                      <button
                        key={badge}
                        type="button"
                        onClick={() => toggleBadge(badge)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm font-medium transition-colors ${
                          selected
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-gray-600 border-gray-300 hover:border-primary/50'
                        }`}
                      >
                        {config.label}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            {/* Things to Know */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Things to Know</CardTitle>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setThingsToKnow(DEFAULT_THINGS_TO_KNOW)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground border border-gray-200 rounded px-2 py-1"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Reset
                    </button>
                    <button
                      type="button"
                      onClick={() => setThingsToKnow([...thingsToKnow, ''])}
                      className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 border border-primary/30 rounded px-2 py-1"
                    >
                      <Plus className="h-3 w-3" />
                      Add
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {thingsToKnow.map((item, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <span className="text-xs text-gray-400 w-4 flex-shrink-0">{i + 1}.</span>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const updated = [...thingsToKnow];
                          updated[i] = e.target.value;
                          setThingsToKnow(updated);
                        }}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                      <button
                        type="button"
                        onClick={() => setThingsToKnow(thingsToKnow.filter((_, j) => j !== i))}
                        className="text-gray-400 hover:text-red-500 flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {thingsToKnow.length === 0 && (
                    <p className="text-xs text-muted-foreground italic">No items — customers will see no &quot;Things to Know&quot; section.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Active for All Events</p>
                    <p className="text-xs text-muted-foreground">Show this lot to customers</p>
                  </div>
                  <Switch checked={isActive} onCheckedChange={setIsActive} />
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-sm font-medium">3rd Party Lot</p>
                    <p className="text-xs text-muted-foreground">Not available for purchase through this app</p>
                  </div>
                  <Switch checked={isThirdParty} onCheckedChange={setIsThirdParty} />
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-sm font-medium">In-Person Sales</p>
                    <p className="text-xs text-muted-foreground">Allow gate agent sales</p>
                  </div>
                  <Switch checked={inPersonEnabled} onCheckedChange={setInPersonEnabled} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Availability Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Gates Open</Label>
                  <Select value={gatesOpenHours} onValueChange={setGatesOpenHours}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hour before kickoff</SelectItem>
                      <SelectItem value="2">2 hours before kickoff</SelectItem>
                      <SelectItem value="3">3 hours before kickoff</SelectItem>
                      <SelectItem value="4">4 hours before kickoff</SelectItem>
                      <SelectItem value="5">5 hours before kickoff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Presale Cutoff</Label>
                  <Select value={presaleCutoffHours} onValueChange={setPresaleCutoffHours}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hour before kickoff</SelectItem>
                      <SelectItem value="2">2 hours before kickoff</SelectItem>
                      <SelectItem value="4">4 hours before kickoff</SelectItem>
                      <SelectItem value="24">24 hours before kickoff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-semibold">{priceCents > 0 ? formatPrice(priceCents) : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Capacity</span>
                  <span className="font-semibold">{capacity ? `${capacity} spots` : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Walk time</span>
                  <span className="font-semibold">{walkTime ? `${walkTime} min` : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Badges</span>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {badges.length > 0
                      ? badges.map((b) => (
                          <Badge key={b} variant="secondary" className="text-xs">
                            {BADGE_CONFIG[b]?.label || b}
                          </Badge>
                        ))
                      : <span className="text-muted-foreground">None</span>}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-2">
              <Button type="submit" disabled={saving} className="w-full">
                {saving ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Lot'}
              </Button>
              <Button type="button" variant="outline" className="w-full" onClick={() => router.push('/admin/lots')}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
