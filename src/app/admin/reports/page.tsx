'use client';

import { BarChart3, DollarSign, Users, Car, TrendingUp, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatPrice, formatEventDate, SEASON_2026_EVENTS } from '@/lib/constants';

// Demo report data
const eventReports = SEASON_2026_EVENTS
  .filter((g) => !g.bye && !g.away)
  .map((game) => ({
    name: `Illinois vs. ${game.opponent}`,
    date: game.date,
    presaleRevenue: Math.floor(Math.random() * 10000) + 5000,
    inPersonRevenue: Math.floor(Math.random() * 3000) + 1000,
    presaleCount: Math.floor(Math.random() * 150) + 50,
    inPersonCount: Math.floor(Math.random() * 50) + 10,
    checkInCount: Math.floor(Math.random() * 150) + 50,
  }));

const lotReports = [
  { name: 'Lot A - Stadium North', revenue: 45000, reservations: 100, occupancy: 100 },
  { name: 'Lot B - Stadium East', revenue: 35000, reservations: 100, occupancy: 67 },
  { name: 'Lot C - Assembly Hall', revenue: 25000, reservations: 100, occupancy: 50 },
  { name: 'Lot D - Research Park', revenue: 20000, reservations: 100, occupancy: 33 },
  { name: 'Lot E - State Farm Center', revenue: 20000, reservations: 80, occupancy: 32 },
  { name: 'Lot F - ADA Accessible', revenue: 15000, reservations: 50, occupancy: 100 },
];

export default function ReportsPage() {
  const totalRevenue = eventReports.reduce(
    (sum, e) => sum + e.presaleRevenue + e.inPersonRevenue,
    0
  );
  const totalReservations = eventReports.reduce(
    (sum, e) => sum + e.presaleCount + e.inPersonCount,
    0
  );
  const totalCheckIns = eventReports.reduce((sum, e) => sum + e.checkInCount, 0);
  const avgOccupancy = Math.round(
    lotReports.reduce((sum, l) => sum + l.occupancy, 0) / lotReports.length
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-muted-foreground">
            Season performance and revenue analytics
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatPrice(totalRevenue * 100)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reservations</p>
                <p className="text-2xl font-bold">{totalReservations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Car className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Check-Ins</p>
                <p className="text-2xl font-bold">{totalCheckIns}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Occupancy</p>
                <p className="text-2xl font-bold">{avgOccupancy}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Tabs */}
      <Tabs defaultValue="events">
        <TabsList>
          <TabsTrigger value="events">By Event</TabsTrigger>
          <TabsTrigger value="lots">By Lot</TabsTrigger>
        </TabsList>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Event Revenue Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Presale</TableHead>
                    <TableHead className="text-right">In-Person</TableHead>
                    <TableHead className="text-right">Total Revenue</TableHead>
                    <TableHead className="text-right">Check-Ins</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eventReports.map((event, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{event.name}</TableCell>
                      <TableCell>{formatEventDate(event.date)}</TableCell>
                      <TableCell className="text-right">
                        <div>
                          <p>{formatPrice(event.presaleRevenue * 100)}</p>
                          <p className="text-xs text-muted-foreground">
                            {event.presaleCount} orders
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div>
                          <p>{formatPrice(event.inPersonRevenue * 100)}</p>
                          <p className="text-xs text-muted-foreground">
                            {event.inPersonCount} orders
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatPrice((event.presaleRevenue + event.inPersonRevenue) * 100)}
                      </TableCell>
                      <TableCell className="text-right">
                        {event.checkInCount}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lots">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Lot Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lot</TableHead>
                    <TableHead className="text-right">Total Revenue</TableHead>
                    <TableHead className="text-right">Reservations</TableHead>
                    <TableHead className="text-right">Avg Occupancy</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lotReports.map((lot, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{lot.name}</TableCell>
                      <TableCell className="text-right font-bold">
                        {formatPrice(lot.revenue * 100)}
                      </TableCell>
                      <TableCell className="text-right">{lot.reservations}</TableCell>
                      <TableCell className="text-right">
                        <span
                          className={
                            lot.occupancy >= 80
                              ? 'text-green-600'
                              : lot.occupancy >= 50
                              ? 'text-yellow-600'
                              : 'text-red-600'
                          }
                        >
                          {lot.occupancy}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
