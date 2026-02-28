export function ExpansionBanner() {
  return (
    <section
      id="expansion"
      className="py-10 px-[5%] text-center"
      style={{ backgroundColor: '#1b2b3c' }}
    >
      <p className="text-white text-lg">
        Own a lot? We&apos;re expanding to new locations and daily parking soon.{' '}
        <a
          href="mailto:hello@cuparking.com"
          className="underline"
          style={{ color: '#22c55e' }}
        >
          Partner with us
        </a>
        .
      </p>
    </section>
  );
}
