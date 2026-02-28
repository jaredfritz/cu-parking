'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Car, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ABOUT_ITEMS = [
  { label: 'About CU Parking', href: '#' },
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'Contact Us', href: 'mailto:hello@cuparking.com' },
  { label: 'Sell Parking', href: '#expansion' },
  { label: 'Admin Portal', href: '/admin' },
];

export function Header() {
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100">
      <div className="container mx-auto px-4 flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Car className="h-6 w-6 text-primary" />
          <span className="font-extrabold text-2xl text-primary tracking-tight">CU Parking</span>
        </Link>

        <nav className="flex items-center gap-6">
          {/* About dropdown */}
          <div
            className="relative hidden md:block"
            onMouseEnter={() => setAboutOpen(true)}
            onMouseLeave={() => setAboutOpen(false)}
          >
            <button className="flex items-center gap-1 font-medium text-base text-gray-700 hover:text-primary transition-colors py-2">
              About <ChevronDown className="h-4 w-4" />
            </button>
            {aboutOpen && (
              <div className="absolute top-full left-0 bg-white shadow-lg rounded-lg py-2 w-52 border border-gray-100">
                {ABOUT_ITEMS.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Log In / Sign Up */}
          <Button size="sm" className="font-medium">
            Log In / Sign Up
          </Button>
        </nav>
      </div>
    </header>
  );
}
