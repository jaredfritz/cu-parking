import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 py-10 px-[5%]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: copyright */}
        <p className="text-sm text-gray-400">
          &copy; 2026 CU Parking.
        </p>

        {/* Right: utility links */}
        <nav className="flex items-center gap-4 text-sm text-gray-500">
          <Link href="/gate" className="hover:underline">
            Gate Agent
          </Link>
          <Link href="#" className="hover:underline">
            Terms of Service
          </Link>
          <Link href="#" className="hover:underline">
            Privacy Policy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
