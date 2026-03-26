import React from "react";
import founderImage from "@/assets/founder/jonathan-profile.webp";
import { TestimonialMarqueeCard } from "@/components/TestimonialMarqueeCard";

export const FounderStorySection: React.FC = () => {
  return (
    <section className="py-16 md:py-20 lg:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-start gap-5 sm:gap-6 mb-6">
            <img
              src={founderImage}
              alt="Jonathan, creator of DigiStorms"
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-cover flex-shrink-0 mx-auto sm:mx-0"
              width="128"
              height="128"
            />
            <p className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 text-center sm:text-left">
              👋 Hey – I'm Jonathan, the creator of DigiStorms.
            </p>
          </div>

          <div className="space-y-4 text-gray-700">
            <p>
              Before building this, I spent years helping SaaS companies improve their onboarding emails, and I kept seeing the same problem:
            </p>

            <p>
              Founders spend weeks creating onboarding sequences, only to end up with something that barely works.
            </p>

            <p>So I decided to fix it.</p>

            <p>I built DigiStorms for 3 simple reasons:</p>

            <ol className="list-decimal list-inside space-y-2 pl-1">
              <li>Help SaaS founders create high-converting onboarding emails in minutes, not weeks.</li>
              <li>Turn user activation into a real growth engine, not an afterthought.</li>
              <li>Make it effortless to guide every new signup toward their first value moment.</li>
            </ol>

            <p>Onboarding is one of the biggest missed opportunities in SaaS.</p>

            <p>Now, with DigiStorms, you can finally turn it into your competitive edge.</p>
          </div>
        </div>
      </div>

      <div className="mt-12 overflow-hidden w-full" style={{ paddingBottom: "2rem" }}>
        <div className="marquee-track" style={{ paddingLeft: "2rem" }}>
          <TestimonialMarqueeCard company="Bubbleye" industry="Marketing Automation" quote="Jonathan's professionalism, speed, and competence in writing and strategic planning are remarkable. I highly recommend him." author="Stefano Roncari" color="bg-blue-500" logoUrl="/images-testimonials/bubbleye_logo.jpeg" avatarUrl="/images-testimonials/stefano.webp" />
          <TestimonialMarqueeCard company="Blaze Type" industry="Font Solutions" quote="Jonathan's approach to retention has been a game-changer for us. Our customer lifetime value has significantly increased." author="Matthieu Salvaggio" color="bg-rose-500" logoUrl="/images-testimonials/blaze.png" avatarUrl="/images-testimonials/matt.webp" />
          <TestimonialMarqueeCard company="BryteBridge" industry="Non-Profit Solutions" quote="Jonathan is a rising star in Lifecycle Marketing and one of a few trusted freelancers I send referrals to. If you need help going 0 to 1 on your B2B SaaS lifecycle programs, give Jonathan a shout. His attitude, quality, and speed to delivery are all top-notch." author="Drew Price" color="bg-red-500" logoUrl="/images-testimonials/brytebridge.webp" avatarUrl="/images-testimonials/drew.webp" logoSizeClass="h-16 w-16" />
          <TestimonialMarqueeCard company="Magrid" industry="EdTech" quote="The team's expertise in email marketing transformed our user engagement metrics. We've never seen such positive results!" author="Tahereh Pazouki" color="bg-violet-500" logoUrl="/images-testimonials/magrid.webp" avatarUrl="/images-testimonials/tahereh.webp" />
          <TestimonialMarqueeCard company="Triscale" industry="GTM Expert" quote="I've had the pleasure of collaborating with Jonathan on several projects, and his expertise in lifecycle marketing for B2B SaaS is outstanding. He deeply understands how to drive engagement and retention through smart, data-driven campaigns. Beyond his skills, he's a fantastic partner. Insightful, proactive, and always focused on impact. I highly recommend working with him!" author="Thibault Le Meur" color="bg-gray-700" logoUrl="/images-testimonials/triscale.jpeg" avatarUrl="/images-testimonials/thibault.webp" />
          {/* Duplicate set for seamless loop */}
          <TestimonialMarqueeCard company="Bubbleye" industry="Marketing Automation" quote="Jonathan's professionalism, speed, and competence in writing and strategic planning are remarkable. I highly recommend him." author="Stefano Roncari" color="bg-blue-500" logoUrl="/images-testimonials/bubbleye_logo.jpeg" avatarUrl="/images-testimonials/stefano.webp" />
          <TestimonialMarqueeCard company="Blaze Type" industry="Font Solutions" quote="Jonathan's approach to retention has been a game-changer for us. Our customer lifetime value has significantly increased." author="Matthieu Salvaggio" color="bg-rose-500" logoUrl="/images-testimonials/blaze.png" avatarUrl="/images-testimonials/matt.webp" />
          <TestimonialMarqueeCard company="BryteBridge" industry="Non-Profit Solutions" quote="Jonathan is a rising star in Lifecycle Marketing and one of a few trusted freelancers I send referrals to. If you need help going 0 to 1 on your B2B SaaS lifecycle programs, give Jonathan a shout. His attitude, quality, and speed to delivery are all top-notch." author="Drew Price" color="bg-red-500" logoUrl="/images-testimonials/brytebridge.webp" avatarUrl="/images-testimonials/drew.webp" logoSizeClass="h-16 w-16" />
          <TestimonialMarqueeCard company="Magrid" industry="EdTech" quote="The team's expertise in email marketing transformed our user engagement metrics. We've never seen such positive results!" author="Tahereh Pazouki" color="bg-violet-500" logoUrl="/images-testimonials/magrid.webp" avatarUrl="/images-testimonials/tahereh.webp" />
          <TestimonialMarqueeCard company="Triscale" industry="GTM Expert" quote="I've had the pleasure of collaborating with Jonathan on several projects, and his expertise in lifecycle marketing for B2B SaaS is outstanding. He deeply understands how to drive engagement and retention through smart, data-driven campaigns. Beyond his skills, he's a fantastic partner. Insightful, proactive, and always focused on impact. I highly recommend working with him!" author="Thibault Le Meur" color="bg-gray-700" logoUrl="/images-testimonials/triscale.jpeg" avatarUrl="/images-testimonials/thibault.webp" />
        </div>
      </div>
    </section>
  );
};
