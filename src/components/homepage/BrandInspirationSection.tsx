
import React from 'react';

const brandsLine1 = [
  { name: 'Ahrefs', logo: '/lovable-uploads/e2745264-1c67-4d20-82ff-4a23da93c805.png' },
  { name: 'Canva', logo: '/lovable-uploads/03ed71bf-f6d2-446c-a7e1-0ff18a4cdfe5.png' },
  { name: 'Hunter', logo: '/lovable-uploads/f3ff1548-6536-48c9-b8e2-c04be2c55a5f.png' },
  { name: 'PhantomBusters', logo: '/lovable-uploads/7b6959b4-ba3b-4764-954a-4530e77cc8d2.png' },
  { name: 'SemRush', logo: '/lovable-uploads/c9e74517-577a-4c0c-9882-1316b7d90f91.png' },
  { name: 'Webflow', logo: '/lovable-uploads/49d5429e-ca02-452d-a219-a318dc1107c7.png' },
];

const brandsLine2 = [
  { name: 'Calendly', logo: '/lovable-uploads/92db5e95-d4f3-4040-a18b-0d55f9050214.png' },
  { name: 'Loom', logo: '/lovable-uploads/74d41a97-44dd-46ee-89dd-226ec3697778.png' },
  { name: 'Miro', logo: '/lovable-uploads/9825d781-d66c-45e9-8c24-a0138c4d9ea0.png' },
  { name: 'Notion', logo: '/lovable-uploads/4ce812ac-8b5c-420d-b92a-910d28072dc1.png' },
  { name: 'Pipedrive', logo: '/lovable-uploads/1ac60114-aa62-45b2-9261-48962e653895.png' },
  { name: 'Zapier', logo: '/lovable-uploads/9e9ac97b-cf86-487c-a173-abdaf685c7a3.png' },
];

const brandsLine3 = [
  { name: 'Apollo', logo: '/lovable-uploads/a4442ccf-1a97-4f68-933f-85d84a5d7152.png' },
  { name: 'Buffer', logo: '/lovable-uploads/c7887007-2763-4cf0-93e6-598027008771.png' },
  { name: 'Figma', logo: '/lovable-uploads/b8bded1e-df61-4272-b5fe-4ecc1ef008d2.png' },
  { name: 'Grammarly', logo: '/lovable-uploads/853062f9-358b-4a5d-a514-bb52e6461d71.png' },
  { name: 'Lucid', logo: '/lovable-uploads/09228424-9c38-4981-a23d-c251b1d01090.png' },
  { name: 'MailChimp', logo: '/lovable-uploads/5fc77848-0533-43b2-b342-fa3033a6484c.png' },
];

export const BrandInspirationSection: React.FC = () => {
  return (
    <section className="py-16 md:py-20 lg:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
            Inspired by the best SaaS onboarding programs
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed" style={{ fontSize: "22px" }}>
            DigiStorms is trained on 1,000+ real SaaS lifecycle emails from companies that obsess over activation and retention.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="relative overflow-hidden">
            <div className="flex animate-scroll gap-8">
              {[...Array(4)].map((_, setIndex) => 
                brandsLine1.map((brand, index) => (
                  <div 
                    key={`set-${setIndex}-${index}`}
                    className="flex-shrink-0 flex items-center justify-center h-16 transition-all duration-300"
                  >
                    <img 
                      src={brand.logo} 
                      alt={brand.name}
                      className="h-12 w-auto object-contain"
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="relative overflow-hidden">
            <div className="flex animate-scroll-reverse gap-8">
              {[...Array(4)].map((_, setIndex) => 
                brandsLine2.map((brand, index) => (
                  <div 
                    key={`set-${setIndex}-${index}`}
                    className="flex-shrink-0 flex items-center justify-center h-16 transition-all duration-300"
                  >
                    <img 
                      src={brand.logo} 
                      alt={brand.name}
                      className="h-12 w-auto object-contain"
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="relative overflow-hidden">
            <div className="flex animate-scroll gap-8">
              {[...Array(4)].map((_, setIndex) => 
                brandsLine3.map((brand, index) => (
                  <div 
                    key={`set-${setIndex}-${index}`}
                    className="flex-shrink-0 flex items-center justify-center h-16 transition-all duration-300"
                  >
                    <img 
                      src={brand.logo} 
                      alt={brand.name}
                      className="h-12 w-auto object-contain"
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            <a 
              href="https://library.digistorms.ai/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 underline transition-colors"
            >
              Check the full library →
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};
