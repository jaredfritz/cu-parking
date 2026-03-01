'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Car, Plus, MoreHorizontal, Pencil, Trash2, MapPin, Check, X } from 'lucide-react';
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
import { formatPrice, BADGE_CONFIG } from '@/lib/constants';
import { getLots, updateLot, deleteLot, type AdminLot } from '@/lib/lots-store';
import { toast } from 'sonner';

type LotDraft = {
  name: string;
  address: string;
  capacity: number;
  price_dollars: number;
  walking_time_minutes: number;
  distance_miles: number;
  lat: number;
  lng: number;
  isThirdParty: boolean;
  inPersonEnabled: boolean;
  gatesOpenHours: number;
  presaleCutoffHours: number;
  isActive: boolean;
};

export default function LotsPage() {
  const [lots, setLots] = useState<AdminLot[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, LotDraft>>({});
  const [saving, setSaving] = useState(false);

  const refresh = async () => setLots(await getLots());

  useEffect(() => { refresh(); }, []);

  const toggleActive = async (lotId: string, current: boolean) => {
    await updateLot(lotId, { isActive: !current });
    await refresh();
    toast.success('Lot status updated');
  };

  const handleDelete = async (lotId: string, name: string) => {
    await deleteLot(lotId);
    await refresh();
    toast.success(`"${name}" deleted`);
  };

  const enterEditMode = () => {
    const initial: Record<string, LotDraft> = {};
    for (const l of lots) {
      initial[l.id] = {
        name: l.name,
        address: l.address,
        capacity: l.capacity,
        price_dollars: l.price_cents / 100,
        walking_time_minutes: l.walking_time_minutes,
        distance_miles: l.distance_miles,
        lat: l.lat,
        lng: l.lng,
        isThirdParty: l.isThirdParty,
        inPersonEnabled: l.inPersonEnabled,
        gatesOpenHours: l.gatesOpenHours ?? 3,
        presaleCutoffHours: l.presaleCutoffHours ?? 1,
        isActive: l.isActive,
      };
    }
    setDrafts(initial);
    setEditMode(true);
  };

  const cancelEditMode = () => {
    setDrafts({});
    setEditMode(false);
  };

  const setDraft = (id: string, patch: Partial<LotDraft>) => {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      await Promise.all(
        lots.map((l) =>
          updateLot(l.id, {
            name: drafts[l.id].name,
            address: drafts[l.id].address,
            capacity: drafts[l.id].capacity,
            price_cents: Math.round(drafts[l.id].price_dollars * 100),
            walking_time_minutes: drafts[l.id].walking_time_minutes,
            distance_miles: drafts[l.id].distance_miles,
            lat: drafts[l.id].lat,
            lng: drafts[l.id].lng,
            isThirdParty: drafts[l.id].isThirdParty,
            inPersonEnabled: drafts[l.id].inPersonEnabled,
            gatesOpenHours: drafts[l.id].gatesOpenHours,
            presaleCutoffHours: drafts[l.id].presaleCutoffHours,
            isActive: drafts[l.id].isActive,
          })
        )
      );
      await refresh();
      setEditMode(false);
      setDrafts({});
      toast.success('All lots saved');
    } catch {
      toast.error('Failed to save lots');
    } finally {
      setSaving(false);
    }
  };

  const cellInput = (cls = '') =>
    `border border-input rounded px-2 py-1 text-sm bg-background w-full ${cls}`;

  const activeLots = lots.filter((l) => l.isActive);
  const totalCapacity = activeLots.reduce((sum, l) => sum + l.capacity, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Parking Lots</h1>
          <p className="text-muted-foreground">Manage parking lots and pricing</p>
        </div>
        <Link href="/admin/lots/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Lot
          </Button>
        </Link>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Lots</p>
            <p className="text-3xl font-bold">{lots.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Active Lots</p>
            <p className="text-3xl font-bold">{activeLots.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Capacity</p>
            <p className="text-3xl font-bold">{totalCapacity} spots</p>
          </CardContent>
        </Card>
      </div>

      {/* Lots Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            All Lots
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Lot Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="whitespace-nowrap">Walk Time</TableHead>
                <TableHead>Distance</TableHead>
                <TableHead>Lat</TableHead>
                <TableHead>Lng</TableHead>
                <TableHead className="whitespace-nowrap">3rd Party</TableHead>
                <TableHead className="whitespace-nowrap">In-Person</TableHead>
                <TableHead className="whitespace-nowrap">Gates Open</TableHead>
                <TableHead className="whitespace-nowrap">Presale Cutoff</TableHead>
                <TableHead>Badges</TableHead>
                <TableHead className="whitespace-nowrap">Active</TableHead>
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
              {lots.map((lot) => {
                const draft = drafts[lot.id];
                return (
                  <TableRow key={lot.id} className={editMode ? 'align-top' : ''}>

                    {/* Lot Name */}
                    <TableCell className="font-medium whitespace-nowrap">
                      {editMode ? (
                        <input
                          className={cellInput('min-w-[140px]')}
                          value={draft.name}
                          onChange={(e) => setDraft(lot.id, { name: e.target.value })}
                          placeholder="Lot name"
                        />
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                          {lot.name}
                        </div>
                      )}
                    </TableCell>

                    {/* Address */}
                    <TableCell>
                      {editMode ? (
                        <input
                          className={cellInput('min-w-[160px]')}
                          value={draft.address}
                          onChange={(e) => setDraft(lot.id, { address: e.target.value })}
                          placeholder="Address"
                        />
                      ) : (
                        <span className="text-sm text-muted-foreground whitespace-nowrap">{lot.address || '—'}</span>
                      )}
                    </TableCell>

                    {/* Capacity */}
                    <TableCell>
                      {editMode ? (
                        <input
                          type="number"
                          className={cellInput('w-20')}
                          value={draft.capacity}
                          onChange={(e) => setDraft(lot.id, { capacity: parseInt(e.target.value) || 0 })}
                          min={0}
                        />
                      ) : (
                        <span className="whitespace-nowrap">{lot.capacity} spots</span>
                      )}
                    </TableCell>

                    {/* Price */}
                    <TableCell>
                      {editMode ? (
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-muted-foreground">$</span>
                          <input
                            type="number"
                            className={cellInput('w-16')}
                            value={draft.price_dollars}
                            onChange={(e) => setDraft(lot.id, { price_dollars: parseFloat(e.target.value) || 0 })}
                            min={0}
                            step={1}
                          />
                        </div>
                      ) : (
                        <span className="font-medium">{formatPrice(lot.price_cents)}</span>
                      )}
                    </TableCell>

                    {/* Walk Time */}
                    <TableCell>
                      {editMode ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            className={cellInput('w-14')}
                            value={draft.walking_time_minutes}
                            onChange={(e) => setDraft(lot.id, { walking_time_minutes: parseInt(e.target.value) || 0 })}
                            min={0}
                          />
                          <span className="text-sm text-muted-foreground">min</span>
                        </div>
                      ) : (
                        <span className="whitespace-nowrap">{lot.walking_time_minutes} min</span>
                      )}
                    </TableCell>

                    {/* Distance */}
                    <TableCell>
                      {editMode ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            className={cellInput('w-16')}
                            value={draft.distance_miles}
                            onChange={(e) => setDraft(lot.id, { distance_miles: parseFloat(e.target.value) || 0 })}
                            min={0}
                            step={0.1}
                          />
                          <span className="text-sm text-muted-foreground">mi</span>
                        </div>
                      ) : (
                        <span className="whitespace-nowrap">{lot.distance_miles} mi</span>
                      )}
                    </TableCell>

                    {/* Lat */}
                    <TableCell>
                      {editMode ? (
                        <input
                          type="number"
                          className={cellInput('w-24')}
                          value={draft.lat}
                          onChange={(e) => setDraft(lot.id, { lat: parseFloat(e.target.value) || 0 })}
                          step={0.0001}
                        />
                      ) : (
                        <span className="text-sm text-muted-foreground tabular-nums">{lot.lat}</span>
                      )}
                    </TableCell>

                    {/* Lng */}
                    <TableCell>
                      {editMode ? (
                        <input
                          type="number"
                          className={cellInput('w-24')}
                          value={draft.lng}
                          onChange={(e) => setDraft(lot.id, { lng: parseFloat(e.target.value) || 0 })}
                          step={0.0001}
                        />
                      ) : (
                        <span className="text-sm text-muted-foreground tabular-nums">{lot.lng}</span>
                      )}
                    </TableCell>

                    {/* 3rd Party */}
                    <TableCell>
                      {editMode ? (
                        <Switch
                          checked={draft.isThirdParty}
                          onCheckedChange={(v) => setDraft(lot.id, { isThirdParty: v })}
                        />
                      ) : (
                        lot.isThirdParty
                          ? <Badge variant="outline" className="text-xs">3P</Badge>
                          : <span className="text-muted-foreground/40 text-sm">—</span>
                      )}
                    </TableCell>

                    {/* In-Person */}
                    <TableCell>
                      {editMode ? (
                        <Switch
                          checked={draft.inPersonEnabled}
                          onCheckedChange={(v) => setDraft(lot.id, { inPersonEnabled: v })}
                        />
                      ) : (
                        lot.inPersonEnabled
                          ? <Badge variant="secondary" className="text-xs">Yes</Badge>
                          : <span className="text-muted-foreground/40 text-sm">—</span>
                      )}
                    </TableCell>

                    {/* Gates Open */}
                    <TableCell>
                      {editMode ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            className={cellInput('w-14')}
                            value={draft.gatesOpenHours}
                            onChange={(e) => setDraft(lot.id, { gatesOpenHours: parseFloat(e.target.value) || 0 })}
                            min={0}
                            step={0.5}
                          />
                          <span className="text-sm text-muted-foreground">hrs</span>
                        </div>
                      ) : (
                        <span className="text-sm whitespace-nowrap">{lot.gatesOpenHours ?? 3} hrs before</span>
                      )}
                    </TableCell>

                    {/* Presale Cutoff */}
                    <TableCell>
                      {editMode ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            className={cellInput('w-14')}
                            value={draft.presaleCutoffHours}
                            onChange={(e) => setDraft(lot.id, { presaleCutoffHours: parseFloat(e.target.value) || 0 })}
                            min={0}
                            step={0.5}
                          />
                          <span className="text-sm text-muted-foreground">hrs</span>
                        </div>
                      ) : (
                        <span className="text-sm whitespace-nowrap">{lot.presaleCutoffHours ?? 1} hrs before</span>
                      )}
                    </TableCell>

                    {/* Badges — read-only; use full edit page to change */}
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {lot.badges.map((badge) => {
                          const config = BADGE_CONFIG[badge];
                          return (
                            <Badge key={badge} variant={config?.variant || 'outline'} className="text-xs whitespace-nowrap">
                              {config?.label || badge}
                            </Badge>
                          );
                        })}
                      </div>
                    </TableCell>

                    {/* Active */}
                    <TableCell>
                      {editMode ? (
                        <div className="flex items-center gap-2 pt-1">
                          <Switch
                            checked={draft.isActive}
                            onCheckedChange={(v) => setDraft(lot.id, { isActive: v })}
                          />
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {draft.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={lot.isActive}
                            onCheckedChange={() => toggleActive(lot.id, lot.isActive)}
                          />
                          <Link
                            href="#"
                            className="text-xs text-primary hover:underline whitespace-nowrap"
                          >
                            Customize →
                          </Link>
                        </div>
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
                              <Link href={`/admin/lots/${lot.id}`} className="flex items-center">
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDelete(lot.id, lot.name)}
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
