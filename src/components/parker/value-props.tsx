import { Search, ShieldCheck, Smile } from 'lucide-react';

const STEPS = [
  {
    icon: Search,
    heading: 'Search',
    body: 'Search and compare prices across local parking facility locations.',
  },
  {
    icon: ShieldCheck,
    heading: 'Guarantee',
    body: 'Pay securely and receive a parking pass instantly via email for your guaranteed spot.',
  },
  {
    icon: Smile,
    heading: 'Relax',
    body: 'On game-day, follow the instructions included with your pass, park, and go!',
  },
];

export function ValueProps() {
  return (
    <section id="how-it-works" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-primary mb-14">
          How CU Parking Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {STEPS.map(({ icon: Icon, heading, body }) => (
            <div key={heading} className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                <Icon className="w-9 h-9 text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">{heading}</h3>
              <p className="text-base text-gray-500 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
