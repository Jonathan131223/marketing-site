import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Brand {
  slug: string;
  name: string;
  logo: string;
}

export const BrandInspirationSection: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    fetch("/data/library/brands.json")
      .then((r) => r.json())
      .then((data: Brand[]) => setBrands(data))
      .catch(() => {/* silently ignore — section just stays empty */});
  }, []);

  const mask =
    "[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]";

  const third = Math.ceil(brands.length / 3);
  const rows = [
    brands.slice(0, third),
    brands.slice(third, third * 2),
    brands.slice(third * 2),
  ];

  return (
    <section className="py-16 md:py-20 lg:py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-semibold text-slate-900 mb-4">
            Inspired by the best SaaS onboarding programs
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed">
            DigiStorms is trained on 1,000+ real SaaS lifecycle emails from companies that obsess over activation and retention.
          </p>
        </div>
      </div>

      {brands.length > 0 && (
        <div className="space-y-5">
          {rows.map((row, rowIdx) => (
            <div key={rowIdx} className={`relative flex overflow-hidden ${mask}`}>
              <div
                className={`flex gap-4 items-center ${rowIdx === 1 ? "animate-scroll-brands-reverse" : "animate-scroll-brands"}`}
                style={{ width: "fit-content" }}
              >
                {[...row, ...row].map((brand, i) => (
                  <Link
                    key={`${brand.slug}-${i}`}
                    to={`/library/brand/${brand.slug}`}
                    className="flex-shrink-0 flex items-center gap-3 bg-white rounded-xl border border-slate-100 px-3 py-2 shadow-sm hover:border-[#1D4ED8] hover:shadow-md transition-all group"
                    title={brand.name}
                  >
                    <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {brand.logo ? (
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          className="w-8 h-8 object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-sm font-bold text-slate-300">
                          {brand.name[0]}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-slate-700 group-hover:text-[#1D4ED8] transition-colors whitespace-nowrap">
                      {brand.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-center mt-10">
        <Link
          to="/library"
          className="text-sm text-slate-600 hover:text-slate-900 underline transition-colors"
        >
          Explore our email library →
        </Link>
      </div>
    </section>
  );
};
