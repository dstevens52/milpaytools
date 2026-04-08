interface KeyFactProps {
  children: React.ReactNode;
}

export function KeyFact({ children }: KeyFactProps) {
  return (
    <div className="my-6 rounded-lg border-l-4 border-red-700 bg-zinc-50 px-5 py-4 not-prose">
      <p className="text-base font-semibold text-zinc-900 leading-snug">{children}</p>
    </div>
  );
}
