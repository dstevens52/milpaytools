import { DATA_AS_OF } from '@/data/constants';

interface Props {
  source: string;
}

export function DataCurrencyBadge({ source }: Props) {
  return (
    <p className="mt-3 text-sm text-zinc-500">
      Data current as of {DATA_AS_OF} &bull; {source}
    </p>
  );
}
