import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Why We Built This',
  description:
    'MilPayTools was built to make military pay and benefits actually understandable. Free calculators, official data, no account required.',
  alternates: { canonical: 'https://www.milpaytools.com/about' },
};

export default function AboutPage() {
  return (
    <>
      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-zinc-100">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-3">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-sm text-zinc-500">
              <li><Link href="/" className="hover:text-zinc-700 transition-colors">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-zinc-800 font-medium">Why We Built This</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* ── Page title ── */}
      <section className="bg-zinc-50 border-b border-zinc-200 py-12 sm:py-16 px-4">
        <div className="mx-auto max-w-3xl">
          <div className="w-8 h-0.5 bg-red-700 rounded-full mb-6" aria-hidden="true" />
          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight text-zinc-900">
            Why We Built This
          </h1>
        </div>
      </section>

      {/* ── Opening paragraphs ── */}
      <section className="bg-white border-b border-zinc-200 py-12 sm:py-16 px-4">
        <div className="mx-auto max-w-3xl">
          <div className="space-y-5 text-base text-zinc-600 leading-relaxed">
            <p>Military pay and benefits are genuinely confusing and unnecessarily complicated.</p>
            <p>
              BAH rates across 40,000 ZIP codes. VA disability math where 50% + 30% somehow equals
              65%. TSP rules that change based on whether you&apos;re in a combat zone. A retirement
              system most people don&apos;t fully understand until they&apos;re five years from hitting
              20. By then it&apos;s basically too late.
            </p>
            <p>
              All of this information is technically available. It&apos;s buried across DFAS PDFs,
              VA.gov pages, and JTR chapters that read like tax code. We just took the hard stuff and
              made it usable. Free calculators that run on official data, no account required, no
              personal info collected, no catch. The calculators on this website will always be free
              to access to everyone.
            </p>
          </div>
        </div>
      </section>

      {/* ── The Backstory ── */}
      <section className="bg-zinc-50 border-b border-zinc-200 py-12 sm:py-16 px-4">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 mb-6">The Backstory</h2>
          <p className="text-base text-zinc-600 leading-relaxed">
            Dan and Ryan have been friends since the age of 14, including being college roommates at
            the University of Nebraska Lincoln. While they took different career paths, the mission
            behind MilPayTools is personal for both of them. We hope that our combined experience can
            uniquely provide something that military families have deserved for a very long time.
          </p>
        </div>
      </section>

      {/* ── Dan Stevens ── */}
      <section className="bg-zinc-50 border-b border-zinc-200 py-12 sm:py-16 px-4">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-col sm:flex-row gap-8 items-start">
            {/* Photo */}
            <div className="flex-none">
              <Image
                src="/images/dan-stevens.jpg"
                alt="Dan Stevens"
                width={120}
                height={120}
                className="w-28 h-28 rounded-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Pull quote */}
              <blockquote className="border-l-4 border-red-700 pl-4 mb-5">
                <p className="text-base sm:text-lg text-zinc-700 leading-relaxed italic">
                  &ldquo;I watched families on every base we lived on make money decisions with half the information. That always stuck with me.&rdquo;
                </p>
              </blockquote>

              <p className="text-lg font-bold text-zinc-900 mb-0.5">Dan Stevens</p>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-5">Founder</p>

              <div className="space-y-4 text-base text-zinc-600 leading-relaxed">
                <p>
                  I grew up on military bases across the world, as my dad is a 20-year veteran of
                  the Air Force. Some of the places we lived were Lajes Field in the Azores,{' '}
                  <Link href="/bah/eielson-afb" className="text-red-700 hover:underline">Eielson
                  AFB</Link> in Alaska, before ultimately retiring at{' '}
                  <Link href="/bah/offutt-afb" className="text-red-700 hover:underline">Offutt AFB</Link>,
                  in Nebraska. One thing I noticed, even as a kid, was how many families around us
                  were basically winging it financially. Not because they were bad with money, but
                  nobody ever sat them down and showed them the full picture.
                </p>
                <p>
                  I&apos;ve spent over 20 years of my career in finance. I&apos;ve worked with
                  hundreds of military families to get VA home loans. And the same thing keeps
                  showing up, that people just need some proper help to understand the finances
                  involved with military service. It&apos;s time to do our part to help make that
                  easier.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Ryan Durand ── */}
      <section className="bg-white py-12 sm:py-16 px-4">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-col sm:flex-row gap-8 items-start">
            {/* Photo */}
            <div className="flex-none">
              <Image
                src="/images/ryan-durand.jpeg"
                alt="Ryan Durand"
                width={120}
                height={120}
                className="w-28 h-28 rounded-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Pull quote */}
              <blockquote className="border-l-4 border-red-700 pl-4 mb-5">
                <p className="text-base sm:text-lg text-zinc-700 leading-relaxed italic">
                  &ldquo;In a career where almost nothing is predictable, your pay and benefits are the exception — but only if you understand them.&rdquo;
                </p>
              </blockquote>

              <p className="text-lg font-bold text-zinc-900 mb-0.5">Ryan Durand</p>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-5">Military Advisor</p>

              <div className="space-y-4 text-base text-zinc-600 leading-relaxed">
                <p>
                  Ryan spent 20 years in the Air Force and Space Force. Eight PCS moves, a combat
                  deployment, command of a $1.6 billion installation, and a retirement he had to
                  figure out himself. Along the way he learned what most service members figure out
                  too late — your pay and benefits actually follow clear rules. They just don&apos;t
                  reward you unless you understand them.
                </p>
                <p>
                  After retiring, Ryan kept showing up for the community. He works in the defense
                  sector and with the Overwatch Project, a veteran suicide prevention organization
                  that trains service members and families to have the hard conversations. That same
                  instinct — show up, be honest, actually help — is what he brings to MilPayTools.
                </p>
                <p>
                  Ryan&apos;s job here is simple: make sure everything we build actually works for
                  the people it&apos;s meant for. That the language sounds like real military life,
                  not a government pamphlet. That no one leaves the site more confused than when they
                  showed up.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
