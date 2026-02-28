import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';
import { HomeEventSection } from '@/components/parker/home-event-section';
import { ExpansionBanner } from '@/components/parker/expansion-banner';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <HomeEventSection />
        <ExpansionBanner />
      </main>
      <Footer />
    </div>
  );
}
