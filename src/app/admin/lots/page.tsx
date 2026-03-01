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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lot Name</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Walk Time</TableHead>
                <TableHead>Badges</TableHead>
                <TableHead>Active for All Events</TableHead>
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
                    <TableCell>
                      {editMode ? (
                        <div className="space-y-1">
                          <input
                            className={cellInput()}
                            value={draft.name}
                            onChange={(e) => setDraft(lot.id, { name: e.target.value })}
                            placeholder="Lot name"
                          />
                          <input
                            className={cellInput('text-xs')}
                            value={draft.address}
                            onChange={(e) => setDraft(lot.id, { address: e.target.value })}
                            placeholder="Address"
                          />
                        </div>
                      ) : (
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium leading-snug">{lot.name}</p>
                            {lot.address && (
                              <p className="text-xs text-muted-foreground">{lot.address}</p>
                            )}
                          </div>
                        </div>
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
                        <span>{lot.capacity} spots</span>
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
                            className={cellInput('w-16')}
                            value={draft.walking_time_minutes}
                            onChange={(e) => setDraft(lot.id, { walking_time_minutes: parseInt(e.target.value) || 0 })}
                            min={0}
                          />
                          <span className="text-sm text-muted-foreground">min</span>
                        </div>
                      ) : (
                        <span>{lot.walking_time_minutes} min</span>
                      )}
                    </TableCell>

                    {/* Badges — read-only in inline mode; use full edit for badge changes */}
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {lot.badges.map((badge) => {
                          const config = BADGE_CONFIG[badge];
                          return (
                            <Badge key={badge} variant={config?.variant || 'outline'} className="text-xs">
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
                          <span className="text-xs text-muted-foreground">
                            {draft.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={lot.isActive}
                            onCheckedChange={() => toggleActive(lot.id, lot.isActive)}
                          />
                          {lot.isThirdParty && (
                            <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded font-medium">3P</span>
                          )}
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
        </CardContent>
      </Card>
    </div>
  );
}
