'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Search, Car, Mail, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface LookupResult {
  id: string;
  license_plate: string;
  email: string;
  lot_name: string;
  check_in_status: string;
}

function LookupContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const lotId = searchParams.get('lot') || '';

  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<LookupResult[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setSearched(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Demo results
    const demoResults: LookupResult[] = query.includes('@')
      ? [
          {
            id: 'res-1',
            license_plate: 'ABC1234',
            email: query,
            lot_name: 'Lot C - Assembly Hall',
            check_in_status: 'pending',
          },
        ]
      : [
          {
            id: 'res-1',
            license_plate: query.toUpperCase(),
            email: 'user@example.com',
            lot_name: 'Lot C - Assembly Hall',
            check_in_status: 'pending',
          },
        ];

    setResults(demoResults);
    setIsLoading(false);
  };

  const handleCheckIn = async (reservationId: string) => {
    // Simulate check-in
    toast.success('Check-in successful!');
    setResults((prev) =>
      prev.map((r) =>
        r.id === reservationId ? { ...r, check_in_status: 'checked_in' } : r
      )
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-primary text-white p-4 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
          onClick={() => router.push('/gate')}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div>
          <h1 className="font-bold">Manual Lookup</h1>
          <p className="text-sm text-white/70">Search by plate or email</p>
        </div>
      </header>

      <main className="flex-1 p-4 space-y-6">
        {/* Search form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="query">License Plate or Email</Label>
            <div className="flex gap-2">
              <Input
                id="query"
                placeholder="ABC1234 or user@email.com"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={isLoading || !query.trim()}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Results */}
        {searched && (
          <div className="space-y-4">
            <h2 className="font-semibold">
              {results.length > 0 ? `Found ${results.length} result(s)` : 'No results found'}
            </h2>

            {results.map((result) => (
              <Card key={result.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono font-bold text-lg">
                          {result.license_plate}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{result.email}</span>
                      </div>
                      <p className="text-sm">{result.lot_name}</p>
                    </div>

                    {result.check_in_status === 'checked_in' ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Checked In</span>
                      </div>
                    ) : (
                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleCheckIn(result.id)}
                      >
                        Check In
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {results.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No reservations found for &quot;{query}&quot;</p>
                  <p className="text-sm mt-2">
                    Try searching with a different plate or email
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function LookupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }
    >
      <LookupContent />
    </Suspense>
  );
}
