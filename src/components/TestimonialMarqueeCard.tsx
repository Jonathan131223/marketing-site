interface TestimonialMarqueeCardProps {
  company: string;
  industry: string;
  quote: string;
  author: string;
  color: string;
  avatarUrl?: string;
  logoUrl?: string;
  logoSizeClass?: string;
}

export function TestimonialMarqueeCard({
  company,
  industry,
  quote,
  author,
  color,
  avatarUrl,
  logoUrl,
  logoSizeClass = "h-8 w-8",
}: TestimonialMarqueeCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow w-56 flex-shrink-0">
      <div className="flex items-center gap-2 mb-3 min-h-[2.8rem]">
        {logoUrl ? (
          <img src={logoUrl} alt={company} className={`${logoSizeClass} rounded-lg object-contain`} width="64" height="64" decoding="async" />
        ) : (
          <div className={`h-7 w-7 rounded-lg ${color} flex items-center justify-center text-white font-bold text-xs`}>
            {company.charAt(0)}
          </div>
        )}
        <div>
          <p className="font-semibold text-slate-900">{company}</p>
          <p className="text-xs text-slate-500">{industry}</p>
        </div>
      </div>
      <div className="border-t border-slate-100 pt-4">
        <p className="text-slate-600 text-sm leading-relaxed mb-4">&quot;{quote}&quot;</p>
        <div className="flex items-center gap-2">
          {avatarUrl ? (
            <img src={avatarUrl} alt={author} className="h-10 w-10 rounded-full object-cover" width="40" height="40" loading="lazy" decoding="async" />
          ) : (
            <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
              <span className="text-xs font-medium text-slate-600">
                {author.split(" ").map((n) => n[0]).join("")}
              </span>
            </div>
          )}
          <p className="text-sm font-medium text-slate-900">{author}</p>
        </div>
      </div>
    </div>
  );
}
