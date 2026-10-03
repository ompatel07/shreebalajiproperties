/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BUYER GUIDES
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Long-form content kept as structured data rather than MDX. The reasoning:
 * MDX would add a compiler, a plugin chain and a content pipeline to a site
 * that has four guides. Typed objects give the same output with no build
 * dependency, and the client can hand new copy to a developer as plain text.
 *
 * If this grows past ~15 guides, move to MDX or a `guides` table in Supabase
 * so the client can edit without a deploy. The route reads from this array
 * only — swapping the source is a one-file change.
 *
 * These exist for a commercial reason: "what is carpet area" and "RERA
 * Gujarat" are searched far more often than any listing, by people who are
 * six months from buying. Answering them properly is how the relationship
 * starts.
 */

export interface GuideSection {
  heading: string;
  /** Paragraphs. Rendered in order. */
  body: string[];
  /** Optional pull-out, rendered as a callout after the body. */
  callout?: { label: string; text: string };
  /** Optional comparison table. */
  table?: { caption: string; head: string[]; rows: string[][] };
}

export interface Guide {
  slug: string;
  title: string;
  /** <title> and H1 can differ — the H1 can be shorter. */
  metaTitle: string;
  description: string;
  /** Monospace label above the H1. */
  category: string;
  readMinutes: number;
  updated: string;
  /** One-paragraph standfirst under the H1. */
  standfirst: string;
  sections: GuideSection[];
  faqs: { q: string; a: string }[];
  /** Slugs of related guides. */
  related: string[];
}

export const guides: Guide[] = [
  /* ═════════════════════════════════════════════════════════════════════ */
  {
    slug: "carpet-vs-builtup",
    title: "Carpet, built-up, super built-up: what you are actually buying",
    metaTitle: "Carpet vs Built-up vs Super Built-up Area — Explained for Indian Buyers",
    description:
      "The three area figures used in Indian property, what each one includes, why RERA mandates carpet area, and how to spot a listing quoting super built-up to look cheaper per sq.ft.",
    category: "Buying basics",
    readMinutes: 6,
    updated: "2026-09-18",
    standfirst:
      "Two flats on the same street can be advertised at ₹6,200 and ₹8,900 per sq.ft and be identical in size. The difference is almost never the quality of the building — it is which of three area figures the seller chose to divide by.",
    sections: [
      {
        heading: "The three figures",
        body: [
          "Carpet area is the floor you can actually put furniture on: the usable area inside the walls of your flat, excluding the thickness of external walls, the shaft, the lift lobby and the staircase. Under the Real Estate (Regulation and Development) Act, 2016, this is the only figure a promoter may legally use to sell an under-construction home, and it must be stated in the agreement.",
          "Built-up area adds the thickness of the walls themselves, plus the balcony and any utility area. In practice it runs about 10–15% above carpet, depending on how thick the walls are and how generous the balcony is.",
          "Super built-up area adds your proportionate share of everything common to the building — lobbies, staircases, lift wells, the clubhouse, the gym, the society office, sometimes the underground water tank. This share is called the loading, and it is where the ambiguity lives. In Ahmedabad, loading on a mid-rise apartment typically runs 25–35%; on an amenity-heavy tower with a large clubhouse it can exceed 45%.",
        ],
        table: {
          caption: "The same 1,250 sq.ft carpet flat, three ways",
          head: ["Figure", "Area", "At ₹85 lakh, the implied rate"],
          rows: [
            ["Carpet (RERA)", "1,250 sq.ft", "₹6,800 / sq.ft"],
            ["Built-up (+15%)", "1,438 sq.ft", "₹5,912 / sq.ft"],
            ["Super built-up (+40%)", "1,750 sq.ft", "₹4,857 / sq.ft"],
          ],
        },
        callout: {
          label: "The point",
          text: "Nothing about the flat changed. The price did not change. Only the denominator changed — and the rate appears to fall by 29%. This is the single most common way an Indian property listing is made to look cheaper than its neighbour.",
        },
      },
      {
        heading: "Why RERA mandated carpet area",
        body: [
          "Before 2016, super built-up was the industry standard and the loading was effectively unregulated. Two builders could quote the same super built-up figure for flats whose usable space differed by two hundred square feet, and a buyer had no way to compare them. There was also no requirement to disclose what the loading actually was.",
          "Section 2(k) of the Act defines carpet area precisely, and the model agreement requires it to be stated. That is why every under-construction listing you see from a registered promoter now leads with carpet — and why a listing still leading with super built-up is usually either resale (where the Act does not apply) or hoping you will not notice.",
          "Resale property in a completed building is genuinely exempt. That is not a loophole, it is how the Act is scoped. But it does mean that when you compare an under-construction flat against a resale one, you are often comparing a carpet figure against a super built-up figure — and the resale flat will look dramatically cheaper per square foot while giving you less space.",
        ],
      },
      {
        heading: "How to compare two listings honestly",
        body: [
          "Ask one question of every seller: what is the carpet area, in writing. For an under-construction property the promoter must give it to you. For a resale flat, it is on the original sale deed or can be measured.",
          "Then divide the all-in cost — price plus stamp duty and registration, which is roughly 5.9% in Gujarat — by the carpet figure. That number is comparable across every listing in the city, and it is the only one that is.",
          "Be sceptical of a loading figure above 40%. You are paying for that common area, and while a clubhouse has real value, a 45% loading means nearly a third of your purchase price is buying corridor. Ask what the loading is and what it buys; a straight answer is itself a signal about the developer.",
        ],
        callout: {
          label: "What we do",
          text: "Every listing on this site quotes carpet area and labels it as carpet. Where we have only the carpet figure, we show indicative built-up and super built-up conversions beneath it — so you can see what the same flat would be advertised as elsewhere, and our smaller-sounding number reads as honesty rather than a worse deal.",
        },
      },
    ],
    faqs: [
      {
        q: "Is carpet area the same as usable area?",
        a: "Broadly, yes. RERA carpet area is the net usable floor area within the walls of the apartment, excluding external walls, service shafts, the exclusive balcony or verandah, and the exclusive open terrace — but including internal partition walls. Some older listings use 'usable area' loosely to mean something slightly smaller, so always ask for the RERA carpet figure specifically.",
      },
      {
        q: "What is a normal loading percentage in Ahmedabad?",
        a: "For a straightforward mid-rise apartment, 25–30% is typical. A tower with a substantial clubhouse, a pool and multiple lifts commonly sits at 35–40%. Beyond 45% you should ask precisely what common areas you are paying a share of, because the amenity has to be genuinely good to justify it.",
      },
      {
        q: "Which figure does the bank use for the loan?",
        a: "Lenders value the property as a whole rather than per square foot, so the area figure matters less to them than the technical valuation and the agreement value. It matters enormously to you, though, because it determines how much space your money bought.",
      },
      {
        q: "Can a builder change the carpet area after I book?",
        a: "Only within narrow limits. Under RERA, if the carpet area reduces, the promoter must refund the excess paid, with interest. If it increases, they may charge proportionately, but only up to the limits set out in the agreement. Any change must be disclosed, and this is one of the specific protections the Act gives you — which is why the carpet figure belongs in your agreement in writing.",
      },
    ],
    related: ["rera-gujarat", "buying-checklist"],
  },

  /* ═════════════════════════════════════════════════════════════════════ */
  {
    slug: "rera-gujarat",
    title: "RERA in Gujarat: how to check a project in two minutes",
    metaTitle: "RERA Gujarat — How to Verify a Project or Agent (GujRERA Guide)",
    description:
      "What the Gujarat RERA registration number tells you, how to look up a project or agent on the GujRERA portal, what to do if a project is not registered, and the protections the Act actually gives a buyer.",
    category: "Due diligence",
    readMinutes: 7,
    updated: "2026-09-18",
    standfirst:
      "A RERA registration number is the cheapest due diligence available to an Indian property buyer. It takes about two minutes, it is free, and it tells you more about a project than an afternoon of site visits.",
    sections: [
      {
        heading: "What the number actually means",
        body: [
          "The Real Estate (Regulation and Development) Act, 2016 requires any project above 500 square metres or eight apartments to register with its state authority before it can be advertised, marketed or sold. In Gujarat that authority is GujRERA.",
          "To register, the promoter has to file the land title, the encumbrance details, the sanctioned plan and layout, the proposed completion date, and the details of the architect, structural engineer and contractor. Crucially, they must also deposit 70% of all money collected from buyers into a separate escrow account, withdrawable only in proportion to construction progress and only against certification by an engineer and a chartered accountant.",
          "So a registration number is not a quality certificate. It does not mean the building is good. What it means is that the promoter's claims are on public record, the money is ring-fenced, and there is a forum that can order a refund with interest if the promised date slips.",
        ],
        callout: {
          label: "The 70% rule",
          text: "This is the provision that matters most. Before RERA, money collected for one project routinely funded land acquisition for the next — which is precisely how a developer ends up with six half-built projects and no cash. The escrow requirement is what makes that much harder.",
        },
      },
      {
        heading: "How to check, step by step",
        body: [
          "Go to gujrera.gujarat.gov.in. You do not need to register or log in to search.",
          "For a project: use the project search and enter the registration number the seller gave you, or the project name. You should see the promoter's name, the registered completion date, the approved plan, the land details, and quarterly progress updates the promoter is required to file.",
          "For an agent: use the agent search. Every channel partner and broker legally operating in Gujarat must hold an agent registration. An agent without one is operating illegally, and you have no recourse through the authority against them.",
          "Then compare three things against what you were told: the completion date on the portal versus the date the sales team quoted you; the carpet area on the portal versus the area in your draft agreement; and the promoter's name versus whoever is actually taking your money.",
        ],
      },
      {
        heading: "The three red flags",
        body: [
          "A mismatch between the quoted possession date and the registered one. The registered date is the legally enforceable one. If the brochure says December 2027 and the portal says June 2028, the portal is what you can hold them to.",
          "A project advertised without a registration number at all. Marketing an unregistered project above the threshold is an offence under the Act. If a seller cannot produce a number, the question is not 'why' — the question is why you are still in the conversation.",
          "Quarterly progress updates that have stopped. The promoter is required to keep filing them. A project whose last update is eighteen months old is telling you something.",
        ],
        callout: {
          label: "Where RERA does not apply",
          text: "Resale of a flat in a completed building is exempt — the Act governs promoters selling under-construction inventory, not individuals reselling their own home. So a resale listing without a RERA number is entirely normal, and anyone implying otherwise is either confused or selling you something. The diligence for resale is the title chain and the encumbrance certificate instead.",
        },
      },
      {
        heading: "What you can actually do if it goes wrong",
        body: [
          "If possession is delayed beyond the registered date, you have a choice under Section 18: withdraw and receive a full refund with interest, or stay and receive interest for every month of delay. That interest is prescribed and is substantially higher than a bank deposit rate.",
          "Complaints are filed with GujRERA directly, for a modest fee, and you may appear yourself without an advocate. The authority is required to dispose of a complaint within sixty days, and in practice Gujarat has been among the more responsive states.",
          "The practical caveat: enforcement works best against a promoter who still has assets. The Act is far better at deterring the behaviour than at recovering money from a developer that has genuinely collapsed — which is why the delivery record of the specific builder still matters more than the existence of a registration number.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is a RERA number a guarantee the project will be delivered?",
        a: "No. It means the promoter's commitments are on record, 70% of buyer money sits in escrow against construction progress, and there is a tribunal that can order a refund with interest if they default. It materially reduces the risk and gives you a remedy, but it cannot make a weak developer competent. Check the builder's last three deliveries alongside the registration.",
      },
      {
        q: "Do I need to check RERA for a resale flat?",
        a: "The project registration will usually be irrelevant if the building is complete, because the Act governs promoters selling under-construction stock. For resale, the equivalent diligence is the title chain, the encumbrance certificate, the occupancy certificate, the society NOC and confirmation that any existing mortgage has been discharged.",
      },
      {
        q: "What is the difference between a project number and an agent number?",
        a: "A project registration (usually prefixed PR) covers a specific development and is held by the promoter. An agent registration (usually prefixed AG) covers a broker or channel partner and permits them to market registered projects. You should check both — the project you are buying, and the person selling it to you.",
      },
      {
        q: "Does RERA cover plots and land?",
        a: "Yes, plotted development above the size threshold requires registration in the same way. This is worth knowing because plotted schemes on the outskirts of Ahmedabad are where unregistered marketing is most common.",
      },
    ],
    related: ["buying-checklist", "carpet-vs-builtup"],
  },

  /* ═════════════════════════════════════════════════════════════════════ */
  {
    slug: "buying-checklist",
    title: "The buying checklist we actually use",
    metaTitle: "Property Buying Checklist for Ahmedabad — Legal, Financial & Practical",
    description:
      "The documents, approvals and checks we run before recommending a property in Ahmedabad — title chain, encumbrance certificate, approved plan, society NOC, and the costs buyers routinely forget to budget for.",
    category: "Due diligence",
    readMinutes: 9,
    updated: "2026-09-18",
    standfirst:
      "This is not a general-purpose checklist copied from a national portal. It is the sequence we run on an Ahmedabad property before we are willing to put it in front of a client, in the order we run it, including the parts that are tedious.",
    sections: [
      {
        heading: "Before the site visit",
        body: [
          "Pull the RERA registration and read the registered completion date, not the brochure date. Check the promoter's name matches whoever is taking the money.",
          "Pull the builder's last three completed projects and compare promised handover against actual handover. A developer who has slipped twelve months twice will slip again, and no amenity list compensates for that. This single check eliminates more options than any other.",
          "Establish what the loading is, so the carpet figure is comparable against everything else you are looking at.",
          "Check the jantri valuation for the survey number. Stamp duty is charged on the higher of your agreement value and the jantri rate, so if jantri is above the asking price, your duty bill is larger than you calculated.",
        ],
      },
      {
        heading: "The legal file",
        body: [
          "Title chain, ideally thirty years. You are looking for an unbroken sequence of ownership with no gap and no unexplained transfer. Gaps are where disputes live.",
          "Encumbrance certificate from the sub-registrar, covering at least the last thirteen years. This reveals registered mortgages, liens and attachments. A property with a subsisting mortgage can still be bought — but the discharge has to be part of the transaction, not a promise.",
          "The sanctioned plan and layout approval from AUDA or the municipal corporation, compared against what is physically being built. Unauthorised additional floors are not rare, and they are the buyer's problem after registration, not the builder's.",
          "For under-construction: the commencement certificate. For completed: the occupancy certificate (OC) and the building-use (BU) permission. A flat without a BU permission cannot be lawfully occupied, and lenders will decline it.",
          "For resale: the society's no-objection certificate, the share certificate, the last three years of maintenance receipts, and property-tax receipts up to date.",
          "If the seller is an NRI, the tax position changes materially — TDS is deducted at a much higher rate and requires a lower-deduction certificate to avoid locking up a large sum. Raise it early, not at registration.",
        ],
        callout: {
          label: "The one we never skip",
          text: "The encumbrance certificate. It is inexpensive, it takes a few days, and it is the only document that reliably reveals a charge the seller did not mention. We have walked clients away from two otherwise-excellent flats on the strength of an EC.",
        },
      },
      {
        heading: "The money, in full",
        body: [
          "Buyers budget the price and the down payment, then get caught by everything else. The full picture on a ₹85 lakh purchase in Ahmedabad looks roughly like this.",
        ],
        table: {
          caption: "All-in cost on a ₹85 lakh property",
          head: ["Item", "Typical amount", "Financeable?"],
          rows: [
            ["Agreement value", "₹85,00,000", "Up to 75–90%"],
            ["Down payment (20%)", "₹17,00,000", "No"],
            ["Stamp duty (4.9%)", "₹4,16,500", "No"],
            ["Registration (1%)", "₹85,000", "No"],
            ["Loan processing fee", "₹10,000 – 25,000", "No"],
            ["Legal / advocate", "₹15,000 – 40,000", "No"],
            ["Society transfer & share money", "₹10,000 – 50,000", "No"],
            ["Cash needed before keys", "≈ ₹22,50,000", "—"],
          ],
        },
        callout: {
          label: "If you are a woman buying alone",
          text: "Gujarat waives the 1% registration fee for a sole female purchaser. On ₹85 lakh that is ₹85,000 saved. It also determines who legally owns the asset, so take the decision with your CA rather than purely for the saving.",
        },
      },
      {
        heading: "The practical checks nobody writes down",
        body: [
          "Visit at the time of day you would actually be home. A flat that is serene at 11am on a Tuesday can sit above a wedding hall that runs until midnight on Saturdays.",
          "Visit in the monsoon if you possibly can, or ask neighbours directly about waterlogging. Several otherwise-excellent pockets on the west side have specific lanes that flood, and it does not appear in any document.",
          "Check water supply and pressure on an upper floor, and ask whether the society depends on tankers in summer.",
          "Ask the security guard how long they have worked there and what the maintenance situation is. They will tell you things the sales team will not.",
          "Count the parking. Then count the cars already parked. A one-car allotment in a building where every family has two is a daily argument you are buying into.",
          "Check the actual commute at actual rush hour, in your own vehicle, not on a maps estimate at 2pm.",
        ],
      },
    ],
    faqs: [
      {
        q: "How much should I budget beyond the property price?",
        a: "In Gujarat, plan for roughly 7–8% of the agreement value on top: 4.9% stamp duty, 1% registration (waived for a sole female purchaser), and 1–2% across legal fees, loan processing, society transfer and incidentals. None of it is financeable, so it must come from your own funds.",
      },
      {
        q: "Do I need an advocate if the builder says the title is clear?",
        a: "Yes. The builder's lawyer represents the builder. An independent title search typically costs ₹15,000–40,000 on a transaction of a crore, which is a rounding error against the risk it retires. This is not a step to economise on.",
      },
      {
        q: "What is the single most useful check?",
        a: "The developer's delivery record — promised handover date against actual, for their last three completed projects. It is not a document you can request; it has to be assembled from past buyers and public filings. It eliminates more unsuitable options than every other check combined, and it is the main thing we maintain internally.",
      },
      {
        q: "Should I buy under-construction or ready?",
        a: "Under-construction is typically 10–20% cheaper and lets you pay in stages, but you carry delivery risk and pay GST. Ready-to-move costs more and carries no GST, and you can see exactly what you are buying. If your finances need certainty, or you are paying rent while you wait, ready usually wins despite the higher price.",
      },
    ],
    related: ["rera-gujarat", "carpet-vs-builtup", "gift-city"],
  },

  /* ═════════════════════════════════════════════════════════════════════ */
  {
    slug: "gift-city",
    title: "GIFT City: who it is actually for",
    metaTitle: "GIFT City Property Guide — Prices, Rules & Who Should Buy",
    description:
      "An honest assessment of residential property in GIFT City, Gandhinagar: what makes it genuinely unusual, who the realistic tenant pool is, the rules that differ from the rest of Gujarat, and who should not buy here.",
    category: "Market",
    readMinutes: 8,
    updated: "2026-09-18",
    standfirst:
      "GIFT City is the most unusual residential market in Gujarat and the one most often mis-sold. It is genuinely exceptional for a narrow group of buyers and a poor fit for everyone else, so this guide is mostly about telling the two apart.",
    sections: [
      {
        heading: "What it actually is",
        body: [
          "Gujarat International Finance Tec-City is India's only operational International Financial Services Centre. The IFSC designation is the whole story: entities operating inside it are treated, for many regulatory and tax purposes, as though they were offshore. That is why foreign banks, global fund managers, aircraft-leasing companies and bullion exchanges have set up there rather than in Mumbai.",
          "Physically it is a planned district with infrastructure that does not exist elsewhere in India at this scale: a district cooling system instead of individual air conditioning plants, an automated waste collection network, underground utility tunnels, and separated pedestrian and vehicular levels.",
          "For a resident, the practical consequence is a walk-to-work district with genuinely international-standard services, and an employer base that pays international-standard salaries. That combination is what moves the residential market here, and it is why prices behave unlike anywhere else in Gujarat.",
        ],
      },
      {
        heading: "Who it is for",
        body: [
          "Someone who works in GIFT City, or will. The walk-to-work proposition is the real product, and it is worth paying for if you are the one walking.",
          "An investor targeting a corporate tenant pool. Yields here are driven by banks and funds leasing for relocated staff, usually on company paper and at rents that would be unachievable in Gandhinagar proper. If your thesis is rental income from an institutional tenant, this is the strongest such market in the state.",
          "A long-horizon buyer who believes the IFSC build-out continues. The committed infrastructure and the regulatory moat are real, and the current residential supply is small relative to the employment being created.",
        ],
        callout: {
          label: "Who it is not for",
          text: "A family wanting a conventional Ahmedabad life. GIFT City has limited retail, few schools inside the district, and a social fabric that is still forming. If you want neighbours who have lived there for twenty years, a market you can walk to, and a school five minutes away, Kudasan or Randesan give you more for substantially less money.",
        },
      },
      {
        heading: "The numbers, honestly",
        body: [
          "Residential rates in GIFT City currently run roughly ₹9,500–16,000 per sq.ft on carpet — two to three times what comparable space costs in Kudasan or Sargasan, a few kilometres away.",
          "You are paying for the district, the infrastructure and the tenant pool, not for the construction quality, which is good but not three times better than a decent Ahmedabad tower.",
          "That premium is defensible if your use case is one of the three above. It is very hard to defend if you simply want a nice flat near Gandhinagar — in which case the same money buys considerably more space and amenity in Randesan with a ten-minute drive in.",
        ],
        table: {
          caption: "GIFT City against its neighbours, indicative carpet rates",
          head: ["Locality", "₹/sq.ft", "Primary draw"],
          rows: [
            ["GIFT City", "₹9,500 – 16,000", "Walk to work, IFSC tenant pool"],
            ["Kudasan", "₹5,400 – 9,200", "Space and amenity, short drive to GIFT"],
            ["Randesan", "₹5,200 – 8,900", "Villas, quiet, green"],
            ["Sargasan", "₹5,000 – 8,600", "Volume of new supply, highway access"],
          ],
        },
      },
      {
        heading: "Rules that differ",
        body: [
          "Alcohol is permitted within the GIFT City SEZ for licensed establishments, which is a genuine departure from the rest of Gujarat and part of why the district attracts international firms. This applies to specified premises, not to residences generally — check the current position rather than relying on a sales pitch.",
          "The district cooling system means you do not install or own your air-conditioning plant; you pay for cooling as a metered utility. Budget for it as a running cost and ask for actual historical bills from an existing resident rather than an estimate from a sales office.",
          "Maintenance structures here are district-level as well as society-level, so the all-in monthly outgoing is typically higher than an equivalent Gandhinagar flat. Ask for the full figure, both components, in writing.",
          "For NRI buyers, the IFSC status creates specific possibilities around banking and repatriation that do not exist elsewhere in India. It is genuinely worth a conversation with a CA who has handled an IFSC transaction, because the advantages are real but the mechanics are unfamiliar.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is GIFT City a good investment?",
        a: "It is the strongest rental-yield proposition in the Gandhinagar region because the tenant pool is institutional and well paid, and current residential supply is small against the employment being created. The risk is concentration: the entire thesis rests on the IFSC continuing to attract firms. That has gone well so far, but it is a single bet rather than a diversified one, and it should be sized accordingly.",
      },
      {
        q: "Can NRIs buy in GIFT City?",
        a: "Yes, under the normal rules applying to NRI purchase of Indian residential property. The IFSC status additionally opens up banking and repatriation structures unavailable elsewhere in India, which is why NRI interest here is disproportionate. Take advice from a CA familiar with IFSC transactions specifically — the general NRI property rules are only half the picture.",
      },
      {
        q: "Are there schools and hospitals in GIFT City?",
        a: "Limited provision inside the district itself today, with more committed. In practice residents currently use facilities in Gandhinagar and north Ahmedabad, which is a ten to twenty-five minute drive. If school proximity is your binding constraint, this is the single strongest argument for Kudasan or Randesan instead.",
      },
      {
        q: "How does it compare with Kudasan?",
        a: "Kudasan gives you substantially more space and amenity per rupee, an established social fabric, and a short drive into GIFT. GIFT City gives you the walk to work, the district infrastructure and the corporate tenant pool. If you work inside GIFT, the premium is usually worth it. If you do not, Kudasan is the better buy and we will tell you so.",
      },
    ],
    related: ["buying-checklist", "rera-gujarat"],
  },
];

export const guideBySlug = new Map(guides.map((g) => [g.slug, g]));
