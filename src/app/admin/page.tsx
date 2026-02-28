'use client';

import Link from 'next/link';
import { Calendar, DollarSign, Users, Car, ArrowRight, TrendingUp } from 'lucide-react';
import { StatsCard } from '@/components/admin/stats-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice, formatEventDate, SEASON_2026_EVENTS } from '@/lib/constants';

// Demo stats
const DEMO_STATS = {
  totalRevenue: 125000,
  reservations: 312,
  checkIns: 287,
  avgOccupancy: 78,
};

// Get upcoming home games
const upcomingHomeGames = SEASON_2026_EVENTS
  .filter((g) => !g.away && !g.bye && g.date >= new Date().toISOString().split('T')[0])
  .slice(0, 3);

// Recent activity (demo)
const recentActivity = [
  { type: 'reservation', time: '2 mins ago', details: 'Lot A - ABC1234' },
  { type: 'check_in', time: '5 mins ago', details: 'Lot C - XYZ5678' },
  { type: 'reservation', time: '8 mins ago', details: 'Lot B - DEF9012' },
  { type: 'check_in', time: '12 mins ago', details: 'Lot A - GHI3456' },
];

export default function AdminDashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back. Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <Link href="/admin/events/new">
          <Button>
            <Calendar className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={formatPrice(DEMO_STATS.totalRevenue * 100)}
          description="This season"
          icon={DollarSign}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Reservations"
          value={DEMO_STATS.reservations}
          description="This season"
          icon={Users}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Check-Ins"
          value={DEMO_STATS.checkIns}
          description="This season"
          icon={Car}
          trend={{ value: 5, isPositive: true }}
        />
        <StatsCard
          title="Avg Occupancy"
          value={`${DEMO_STATS.avgOccupancy}%`}
          description="Across all lots"
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Events</CardTitle>
            <Link href="/admin/events">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingHomeGames.map((game, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="font-medium">Illinois vs. {game.opponent}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatEventDate(game.date)} @ {game.time}
                    </p>
                  </div>
                  <Badge variant="outline">{game.notes || 'Home Game'}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 text-sm"
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      activity.type === 'reservation'
                        ? 'bg-blue-500'
                        : 'bg-green-500'
                    }`}
                  />
                  <div className="flex-1">
                    <p className="font-medium">
                      {activity.type === 'reservation' ? 'New Reservation' : 'Check-In'}
                    </p>
                    <p className="text-muted-foreground">{activity.details}</p>
                  </div>
                  <span className="text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Link href="/admin/events/new">
              <Button variant="outline" className="w-full h-20 flex-col">
                <Calendar className="h-6 w-6 mb-2" />
                Create Event
              </Button>
            </Link>
            <Link href="/admin/lots/new">
              <Button variant="outline" className="w-full h-20 flex-col">
                <Car className="h-6 w-6 mb-2" />
                Add Lot
              </Button>
            </Link>
            <Link href="/admin/reports">
              <Button variant="outline" className="w-full h-20 flex-col">
                <TrendingUp className="h-6 w-6 mb-2" />
                View Reports
              </Button>
            </Link>
            <Link href="/gate">
              <Button variant="outline" className="w-full h-20 flex-col">
                <Users className="h-6 w-6 mb-2" />
                Gate Agent
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
