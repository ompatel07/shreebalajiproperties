/**
 * Hand-written types mirroring `supabase/schema.sql`.
 *
 * Kept by hand rather than generated so the shapes the app actually consumes
 * (e.g. `PropertyWithRelations`) live next to the raw row types. If you change
 * the SQL, change this file in the same commit.
 */

export type ListingStatus =
  | "draft"
  | "published"
  | "under_offer"
  | "sold"
  | "rented"
  | "archived";

export type PropertyCategory = "residential" | "commercial" | "land";
export type TransactionType = "sale" | "rent" | "lease";

export type PossessionStatus =
  | "ready-to-move"
  | "new-launch"
  | "possession-in-1-year"
  | "possession-in-2-years"
  | "possession-after-2-years";

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "visit_scheduled"
  | "visited"
  | "negotiating"
  | "closed_won"
  | "closed_lost";

export type LeadSource =
  | "property_enquiry"
  | "contact_form"
  | "sell_request"
  | "calculator"
  | "site_visit"
  | "whatsapp"
  | "call"
  | "walk_in"
  | "referral";

export type UserRole = "admin" | "agent" | "viewer";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Builder {
  id: string;
  slug: string;
  name: string;
  established: number | null;
  logo_url: string | null;
  about: string | null;
  website: string | null;
  projects_done: number | null;
  is_published: boolean;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  builder_id: string | null;
  city: string;
  locality_slug: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  category: PropertyCategory;
  status: ListingStatus;
  possession: PossessionStatus;
  possession_date: string | null;
  rera_id: string | null;
  total_units: number | null;
  total_towers: number | null;
  floors: number | null;
  land_area_acres: number | null;
  price_min: number | null;
  price_max: number | null;
  tagline: string | null;
  description: string | null;
  highlights: string[];
  amenities: string[];
  specifications: Record<string, string | string[]>;
  hero_image: string | null;
  brochure_url: string | null;
  video_url: string | null;
  is_partnered: boolean;
  is_featured: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

/** A point of interest near a listing. Stored as JSONB. */
export interface NearbyPlace {
  name: string;
  type: "school" | "hospital" | "mall" | "transit" | "office" | "park" | "temple";
  distance_km: number;
}

export interface Property {
  id: string;
  slug: string;
  title: string;
  project_id: string | null;
  builder_id: string | null;

  city: string;
  locality_slug: string;
  address: string | null;
  lat: number | null;
  lng: number | null;

  category: PropertyCategory;
  property_type: string;
  transaction: TransactionType;
  status: ListingStatus;

  bhk: number | null;
  bathrooms: number | null;
  balconies: number | null;
  floor_no: number | null;
  total_floors: number | null;
  facing: string | null;
  furnishing: string | null;
  age_years: number | null;

  carpet_sqft: number | null;
  builtup_sqft: number | null;
  super_sqft: number | null;
  plot_sqft: number | null;

  price: number | null;
  price_on_request: boolean;
  maintenance_psf: number | null;
  booking_amount: number | null;
  is_negotiable: boolean;

  possession: PossessionStatus;
  possession_date: string | null;

  rera_id: string | null;
  rera_verified: boolean;

  description: string | null;
  highlights: string[];
  amenities: string[];
  nearby: NearbyPlace[];

  hero_image: string | null;
  video_url: string | null;
  virtual_tour_url: string | null;

  is_featured: boolean;
  is_exclusive: boolean;
  sort_order: number | null;

  view_count: number;
  enquiry_count: number;

  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PropertyImage {
  id: string;
  property_id: string;
  url: string;
  alt: string | null;
  caption: string | null;
  room_tag: string | null;
  width: number | null;
  height: number | null;
  sort_order: number;
  created_at: string;
}

export interface ProjectImage {
  id: string;
  project_id: string;
  url: string;
  alt: string | null;
  caption: string | null;
  kind: string | null;
  sort_order: number;
  created_at: string;
}

export interface FloorPlan {
  id: string;
  project_id: string | null;
  property_id: string | null;
  label: string;
  bhk: number | null;
  carpet_sqft: number | null;
  super_sqft: number | null;
  price: number | null;
  image_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  source: LeadSource;
  status: LeadStatus;
  property_id: string | null;
  project_id: string | null;
  budget_min: number | null;
  budget_max: number | null;
  preferred_bhk: number | null;
  preferred_localities: string[];
  timeline: string | null;
  score: number;
  utm: Record<string, string>;
  referrer: string | null;
  user_agent: string | null;
  ip_hash: string | null;
  assigned_to: string | null;
  notes: string | null;
  follow_up_at: string | null;
  contacted_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SiteVisit {
  id: string;
  lead_id: string | null;
  property_id: string | null;
  project_id: string | null;
  visitor_name: string;
  visitor_phone: string;
  slot_date: string;
  slot_time: string;
  party_size: number;
  status: "requested" | "confirmed" | "completed" | "no_show" | "cancelled";
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  id: string;
  author: string;
  role: string | null;
  locality: string | null;
  avatar_url: string | null;
  quote: string;
  rating: number;
  property_id: string | null;
  is_published: boolean;
  is_featured: boolean;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
}

export interface LocalityStat {
  id: string;
  locality_slug: string;
  quarter: string;
  avg_psf: number;
  yoy_change_pct: number | null;
  inventory: number | null;
  created_at: string;
}

export interface AuditEntry {
  id: number;
  actor_id: string | null;
  actor_email: string | null;
  action: string;
  entity: string | null;
  entity_id: string | null;
  diff: Record<string, unknown> | null;
  created_at: string;
}

/* ── Composed shapes the UI consumes ─────────────────────────────────────── */

export interface PropertyWithRelations extends Property {
  images: PropertyImage[];
  builder: Pick<Builder, "id" | "slug" | "name" | "logo_url"> | null;
  project: Pick<Project, "id" | "slug" | "name" | "rera_id" | "is_partnered"> | null;
  floor_plans?: FloorPlan[];
}

/** The subset a card needs — keeps list queries narrow. */
export type PropertyCard = Pick<
  Property,
  | "id"
  | "slug"
  | "title"
  | "city"
  | "locality_slug"
  | "category"
  | "property_type"
  | "transaction"
  | "status"
  | "bhk"
  | "bathrooms"
  | "carpet_sqft"
  | "super_sqft"
  | "plot_sqft"
  | "price"
  | "price_on_request"
  | "possession"
  | "possession_date"
  | "rera_verified"
  | "hero_image"
  | "is_featured"
  | "is_exclusive"
  | "lat"
  | "lng"
  | "view_count"
>;

export interface ProjectWithRelations extends Project {
  images: ProjectImage[];
  builder: Pick<Builder, "id" | "slug" | "name" | "logo_url"> | null;
  floor_plans: FloorPlan[];
  unit_count?: number;
}

export interface AdminStats {
  properties_total: number;
  properties_live: number;
  properties_draft: number;
  projects_total: number;
  leads_total: number;
  leads_new: number;
  leads_week: number;
  visits_upcoming: number;
  views_total: number;
  inventory_value: number;
}
