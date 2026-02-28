# CU Parking Project Rules

## Core Business Logic
- SERVICE TYPE: Web-First, App-Free marketplace for gameday parking.
- LOCATION FILTER: Inventory must ONLY be displayed for events where `location === 'Champaign, IL'`.
- NEVER display "Away" games or non Champaign-Urbana locations to the Parker.

## UI/UX Standards (SpotHero Aesthetic)
- THEME: "Clean Tech" (White backgrounds, #1b2b3c as primary, #22c55e as accent only).
- TYPOGRAPHY: Geist or Inter. Avoid generic system fonts.
- COMPONENTS: Use shadcn/ui and Lucide icons.
- CARDS: Subtle shadows (`shadow-sm`), 12px rounded corners, high whitespace.

## Technical Stack
- Next.js 14 (App Router), Supabase, Tailwind v4, Stripe.