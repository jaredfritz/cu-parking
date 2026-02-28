'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Car, QrCode, Search, DollarSign, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Demo lots
const DEMO_LOTS = [
  { id: 'lot-1', name: 'Lot A - Stadium North' },
  { id: 'lot-2', name: 'Lot B - Stadium East' },
  { id: 'lot-3', name: 'Lot C - Assembly Hall' },
  { id: 'lot-4', name: 'Lot D - Research Park' },
  { id: 'lot-5', name: 'Lot E - State Farm Center' },
  { id: 'lot-6', name: 'Lot F - ADA Accessible' },
];

export default function GatePage() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedLot, setSelectedLot] = useState<string>('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    // Demo: accept any 4-digit PIN
    if (pin.length === 4) {
      setIsLoggedIn(true);
      setError('');
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('gate_agent_pin', pin);
      }
    } else {
      setError('Please enter a 4-digit PIN');
    }
  };

  const handleLotSelect = (lotId: string) => {
    setSelectedLot(lotId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gate_agent_lot', lotId);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setSelectedLot('');
    setPin('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gate_agent_pin');
      localStorage.removeItem('gate_agent_lot');
    }
  };

  // Login screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-primary">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Car className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Gate Agent Login</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pin">Enter PIN</Label>
              <Input
                id="pin"
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                className="text-center text-2xl tracking-widest"
              />
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
            </div>
            <Button className="w-full" onClick={handleLogin}>
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Lot selection screen
  if (!selectedLot) {
    return (
      <div className="min-h-screen p-4 bg-primary">
        <div className="max-w-sm mx-auto pt-8">
          <div className="text-white text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">CU Parking</h1>
            <p className="text-white/70">Select your assigned lot</p>
          </div>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <Select onValueChange={handleLotSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a lot..." />
                </SelectTrigger>
                <SelectContent>
                  {DEMO_LOTS.map((lot) => (
                    <SelectItem key={lot.id} value={lot.id}>
                      {lot.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" className="w-full" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Main gate interface
  const selectedLotName = DEMO_LOTS.find((l) => l.id === selectedLot)?.name || 'Unknown Lot';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-primary text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/70">Assigned Lot</p>
            <h1 className="font-bold">{selectedLotName}</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
            onClick={() => setSelectedLot('')}
          >
            Change
          </Button>
        </div>

        {/* Inventory counter */}
        <div className="mt-4 bg-white/10 rounded-lg p-3 flex items-center justify-between">
          <span className="text-white/70">Remaining Spots</span>
          <span className="text-3xl font-bold">47 / 200</span>
        </div>
      </header>

      {/* Action buttons */}
      <main className="flex-1 p-4 space-y-4">
        <Button
          size="lg"
          className="w-full h-20 text-lg bg-green-600 hover:bg-green-700"
          onClick={() => router.push(`/gate/scan?lot=${selectedLot}`)}
        >
          <QrCode className="h-6 w-6 mr-3" />
          Scan QR Code
        </Button>

        <Button
          size="lg"
          variant="outline"
          className="w-full h-16"
          onClick={() => router.push(`/gate/lookup?lot=${selectedLot}`)}
        >
          <Search className="h-5 w-5 mr-3" />
          Manual Lookup
        </Button>

        <Button
          size="lg"
          variant="outline"
          className="w-full h-16"
          onClick={() => router.push(`/gate/pay-now?lot=${selectedLot}`)}
        >
          <DollarSign className="h-5 w-5 mr-3" />
          Pay Now (Walk-up)
        </Button>
      </main>

      {/* Footer */}
      <footer className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full text-muted-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </footer>
    </div>
  );
}
