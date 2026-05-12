import Image from 'next/image';

export function AuthorBio() {
  return (
    <div className="mt-12 pt-8 border-t border-zinc-200 not-prose">
      <div className="flex items-start gap-4">
        <Image
          src="/images/dan-stevens.jpg"
          alt="Dan Stevens"
          width={48}
          height={48}
          className="flex-none rounded-full object-cover"
        />
        <div>
          <p className="font-semibold text-zinc-900">Dan Stevens</p>
          <p className="text-sm text-zinc-600 mt-1 leading-relaxed">
            Dan Stevens grew up on Air Force bases around the world as the son of a 20-year Air
            Force veteran. He&apos;s now an NMLS-licensed mortgage industry professional building
            financial tools for the military community he grew up in.
          </p>
        </div>
      </div>
    </div>
  );
}
