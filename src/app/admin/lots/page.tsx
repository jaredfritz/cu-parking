'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Car, Plus, MoreHorizontal, Pencil, Trash2, MapPin } from 'lucide-react';
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

export default function LotsPage() {
  const [lots, setLots] = useState<AdminLot[]>([]);

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
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lots.map((lot) => (
                <TableRow key={lot.id}>
                  <TableCell>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium leading-snug">{lot.name}</p>
                        {lot.address && (
                          <p className="text-xs text-muted-foreground">{lot.address}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{lot.capacity} spots</TableCell>
                  <TableCell className="font-medium">{formatPrice(lot.price_cents)}</TableCell>
                  <TableCell>{lot.walking_time_minutes} min</TableCell>
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
                  <TableCell>
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
