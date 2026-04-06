interface DisclaimerProps {
  dataYear?: string;
  className?: string;
}

export function Disclaimer({ dataYear = '2026', className = '' }: DisclaimerProps) {
  return (
    <div
      className={[
        'rounded-lg bg-slate-50 border border-slate-200 p-4 text-xs text-slate-500 leading-relaxed',
        className,
      ].join(' ')}
    >
      <p className="font-semibold text-slate-600 mb-1">Disclaimer</p>
      <p>
        MilPayTools calculators use official DoD and VA rate tables ({dataYear}) for educational
        purposes only. Results are estimates and may not reflect your exact situation. Always verify
        your pay and benefits with your unit&apos;s Finance Office, your MyPay account, or an
        accredited military financial counselor. Tax calculations are illustrative estimates — consult
        a tax professional for personalized advice. This tool is not affiliated with the Department of
        Defense, the VA, or any government agency.
      </p>
    </div>
  );
}
