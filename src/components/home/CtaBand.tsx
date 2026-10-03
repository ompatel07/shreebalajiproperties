import Image from "next/image";
import { ArrowRight, MessageCircle, Phone } from "lucide-react";

import { Reveal } from "@/components/motion/Reveal";
import { ButtonExternal, ButtonLink } from "@/components/ui/Button";
import { site } from "@/config/site";
import { blurPlaceholder, unsplash } from "@/lib/imagery";
import { telLink, whatsappLink } from "@/lib/utils";

/**
 * Closing call to action.
 *
 * Three routes out, in the order this market actually uses them: phone,
 * WhatsApp, then a form. Putting the form first is a conversion mistake here
 * — a buyer comparing four flats on a Sunday afternoon wants to talk to
 * someone now, and WhatsApp is free for us to support.
 */
export function CtaBand() {
  const message = `Hi ${site.name}, I saw your site and I would like some help finding a property in Ahmedabad.`;

  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <Image
          src={unsplash("1600607687939-ce8a6c25118c", 2000, 72)}
          alt=""
          aria-hidden
          fill
          sizes="100vw"
          placeholder="blur"
          blurDataURL={blurPlaceholder()}
          className="photo-warm object-cover"
        />
        <div className="absolute inset-0 bg-ink/82" aria-hidden />
        <div className="absolute inset-0 bg-brass-deep/15 mix-blend-multiply" aria-hidden />
      </div>

      <div className="shell py-24 lg:py-32">
        <Reveal className="mx-auto max-w-3xl text-center">
          <div>
            <p className="eyebrow mb-7 text-bone/60">No obligation, no hard sell</p>

            <h2 className="display-tight font-display text-h2 text-bone">
              Tell us the budget and the commute.
              <br />
              <em className="display-wonk text-brass-light">We will tell you the truth</em>{" "}
              about what it buys.
            </h2>

            <p className="mx-auto mt-7 max-w-xl text-lead text-bone/72">
              One conversation, usually twenty minutes. If Ahmedabad does not have
              what you are describing at that number, we will say so — and tell you
              what it would actually take.
            </p>

            <div className="mt-11 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ButtonExternal
                href={whatsappLink(site.contact.whatsapp, message)}
                variant="brass"
                size="lg"
                icon={<ArrowRight className="size-4" strokeWidth={2} aria-hidden />}
              >
                <MessageCircle className="size-4" strokeWidth={1.9} aria-hidden />
                WhatsApp us
              </ButtonExternal>

              <a
                href={telLink(site.contact.phoneE164)}
                className="inline-flex h-14 items-center justify-center gap-2.5 rounded-[2px] border border-bone/35 px-8 font-semibold text-[0.8125rem] tracking-[0.14em] text-bone uppercase transition-all duration-300 hover:border-bone hover:bg-bone hover:text-ink"
              >
                <Phone className="size-4" strokeWidth={1.9} aria-hidden />
                {site.contact.phoneDisplay}
              </a>

              <ButtonLink href="/contact" variant="ghost" size="lg" className="text-bone hover:bg-bone/12">
                Or send a brief
              </ButtonLink>
            </div>

            <p className="mt-9 font-semibold text-micro tracking-[0.12em] text-bone/45 uppercase">
              {site.office.hours} · Replies within the working day
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
