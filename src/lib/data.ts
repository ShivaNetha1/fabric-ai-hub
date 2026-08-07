import cotton from "@/assets/fabric-cotton.jpg";
import silk from "@/assets/fabric-silk.jpg";
import linen from "@/assets/fabric-linen.jpg";
import denim from "@/assets/fabric-denim.jpg";
import wool from "@/assets/fabric-wool.jpg";
import hero from "@/assets/hero-fabrics.jpg";

export const fabricImages = { cotton, silk, linen, denim, wool, hero };

export type Availability = "In stock" | "Made to order" | "Low stock";

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  material: string;
  composition: string;
  image: string;
  gallery: string[];
  pricePerMetre: number;
  currency: "₹";
  moq: number;
  gsm: number;
  widthCm: number;
  colors: { name: string; hex: string }[];
  supplierId: string;
  rating: number;
  reviews: number;
  leadTimeDays: number;
  availability: Availability;
  certifications: string[];
  sustainable: boolean;
  tags: string[];
  description: string;
  stockMetres: number;
}

export interface Supplier {
  id: string;
  name: string;
  city: string;
  country: string;
  since: number;
  verified: boolean;
  rating: number;
  orders: number;
  responseHours: number;
  categories: string[];
  certificates: string[];
  about: string;
  hours: string;
  email: string;
  phone: string;
  businessType?: string;
  contactInfo?: string;
  address?: string;
  fabricTypes?: string[];
  moq?: number;
  logoUrl?: string;
}

export const suppliers: Supplier[] = [
  {
    id: "arvind-weaves",
    name: "Arvind Weaving House",
    city: "Ahmedabad",
    country: "India",
    since: 1994,
    verified: true,
    rating: 4.9,
    orders: 12480,
    responseHours: 2,
    categories: ["Cotton", "Denim", "Yarn-dyed"],
    certificates: ["GOTS", "OEKO-TEX 100", "ISO 9001"],
    about:
      "Three generations of vertically integrated cotton weaving. 42 air-jet looms, in-house dyeing and a 90,000 metre monthly capacity serving apparel brands across 18 countries.",
    hours: "Mon–Sat · 09:00–19:00 IST",
    email: "trade@arvindweaves.in",
    phone: "+91 79 4001 2200",
  },
  {
    id: "kanchi-silk",
    name: "Kanchi Silk Mills",
    city: "Kanchipuram",
    country: "India",
    since: 1981,
    verified: true,
    rating: 4.8,
    orders: 6120,
    responseHours: 4,
    categories: ["Silk", "Blends", "Jacquard"],
    certificates: ["Silk Mark", "OEKO-TEX 100"],
    about:
      "Master silk house specialising in mulberry charmeuse, dupion and hand-guided jacquard for luxury ateliers and bridal labels.",
    hours: "Mon–Fri · 10:00–18:30 IST",
    email: "orders@kanchisilk.com",
    phone: "+91 44 2722 8890",
  },
  {
    id: "baltic-linen",
    name: "Baltic Linen Works",
    city: "Vilnius",
    country: "Lithuania",
    since: 2006,
    verified: true,
    rating: 4.9,
    orders: 3840,
    responseHours: 6,
    categories: ["Linen", "Hemp", "Home textiles"],
    certificates: ["Masters of Linen", "GOTS", "EU Flax"],
    about:
      "European flax spun and woven within 300 km of the field. Stonewashed finishes, low-water dyeing and full traceability to the harvest lot.",
    hours: "Mon–Fri · 08:00–17:00 EET",
    email: "hello@balticlinen.lt",
    phone: "+370 5 210 4488",
  },
  {
    id: "milano-lana",
    name: "Milano Lana Tessuti",
    city: "Biella",
    country: "Italy",
    since: 1967,
    verified: true,
    rating: 5.0,
    orders: 2210,
    responseHours: 8,
    categories: ["Wool", "Suiting", "Cashmere"],
    certificates: ["RWS", "ISO 14001"],
    about:
      "Biella wool mill producing Super 120s–180s suiting for tailoring houses. Water sourced from the Alpine basin, closed-loop finishing.",
    hours: "Mon–Fri · 09:00–17:30 CET",
    email: "export@milanolana.it",
    phone: "+39 015 840 2211",
  },
];

const c = (name: string, hex: string) => ({ name, hex });

export const products: Product[] = [
  {
    id: "organic-cotton-poplin",
    name: "Organic Cotton Poplin 120 GSM",
    subtitle: "Combed compact yarn · shirting weight",
    material: "Cotton",
    composition: "100% GOTS organic cotton",
    image: cotton,
    gallery: [cotton, linen, hero],
    pricePerMetre: 212,
    currency: "₹",
    moq: 300,
    gsm: 120,
    widthCm: 148,
    colors: [c("Ivory", "#F4F1EA"), c("Sky", "#BBD3F0"), c("Slate", "#54617A")],
    supplierId: "arvind-weaves",
    rating: 4.8,
    reviews: 214,
    leadTimeDays: 12,
    availability: "In stock",
    certifications: ["GOTS", "OEKO-TEX 100"],
    sustainable: true,
    tags: ["Shirting", "Breathable", "Bestseller"],
    description:
      "A crisp, high-thread-count poplin woven from combed compact organic yarn. Holds a press beautifully, resists pilling and finishes with a dry, matte hand — the default choice for premium formal shirting programmes.",
    stockMetres: 42800,
  },
  {
    id: "mulberry-silk-charmeuse",
    name: "Mulberry Silk Charmeuse 19 MM",
    subtitle: "Grade 6A filament · liquid drape",
    material: "Silk",
    composition: "100% mulberry silk",
    image: silk,
    gallery: [silk, hero, cotton],
    pricePerMetre: 1480,
    currency: "₹",
    moq: 100,
    gsm: 86,
    widthCm: 114,
    colors: [c("Sapphire", "#1E40AF"), c("Onyx", "#111827"), c("Champagne", "#E8DCC4")],
    supplierId: "kanchi-silk",
    rating: 4.9,
    reviews: 96,
    leadTimeDays: 18,
    availability: "Made to order",
    certifications: ["Silk Mark", "OEKO-TEX 100"],
    sustainable: false,
    tags: ["Luxury", "Eveningwear", "Low MOQ"],
    description:
      "Nineteen-momme charmeuse with a mirror face and matte reverse. Reactive-dyed in small lots for colour depth that survives twenty washes without bleeding.",
    stockMetres: 6400,
  },
  {
    id: "european-flax-linen",
    name: "European Flax Linen 185 GSM",
    subtitle: "Stonewashed · garment-ready",
    material: "Linen",
    composition: "100% EU flax linen",
    image: linen,
    gallery: [linen, hero, wool],
    pricePerMetre: 486,
    currency: "₹",
    moq: 200,
    gsm: 185,
    widthCm: 150,
    colors: [c("Sand", "#E3CBA5"), c("Sage", "#9CA98C"), c("Chalk", "#F2EFE9")],
    supplierId: "baltic-linen",
    rating: 4.9,
    reviews: 158,
    leadTimeDays: 15,
    availability: "In stock",
    certifications: ["Masters of Linen", "GOTS", "EU Flax"],
    sustainable: true,
    tags: ["Resort", "Traceable", "Stonewashed"],
    description:
      "Field-to-fabric traceable flax, enzyme washed to a lived-in softness on arrival. Shrinkage pre-stabilised to under 3% so cutting tables need no compensation.",
    stockMetres: 21500,
  },
  {
    id: "selvedge-denim-13oz",
    name: "Selvedge Denim 13.5 oz",
    subtitle: "Rope-dyed indigo · shuttle loom",
    material: "Denim",
    composition: "98% cotton · 2% elastane",
    image: denim,
    gallery: [denim, hero, cotton],
    pricePerMetre: 742,
    currency: "₹",
    moq: 400,
    gsm: 458,
    widthCm: 92,
    colors: [c("Raw Indigo", "#1B2A4A"), c("Washed", "#4A6491")],
    supplierId: "arvind-weaves",
    rating: 4.7,
    reviews: 132,
    leadTimeDays: 22,
    availability: "Low stock",
    certifications: ["OEKO-TEX 100", "ISO 9001"],
    sustainable: false,
    tags: ["Heritage", "Shuttle loom", "Fades well"],
    description:
      "Rope-dyed on vintage shuttle looms for an authentic slubby character and clean selvedge ID. Develops high-contrast fades from month three of wear.",
    stockMetres: 3120,
  },
  {
    id: "super-130s-wool",
    name: "Super 130s Wool Suiting",
    subtitle: "Biella spun · year-round weight",
    material: "Wool",
    composition: "100% RWS merino wool",
    image: wool,
    gallery: [wool, hero, silk],
    pricePerMetre: 2260,
    currency: "₹",
    moq: 60,
    gsm: 260,
    widthCm: 152,
    colors: [c("Charcoal", "#333A45"), c("Navy", "#1F2A44"), c("Grey Mélange", "#8A909B")],
    supplierId: "milano-lana",
    rating: 5.0,
    reviews: 74,
    leadTimeDays: 26,
    availability: "Made to order",
    certifications: ["RWS", "ISO 14001"],
    sustainable: true,
    tags: ["Tailoring", "Super 130s", "Low MOQ"],
    description:
      "A four-season worsted with natural stretch recovery and a quiet lustre. Cut and sewn by tailoring houses in Naples, London and Tokyo.",
    stockMetres: 1840,
  },
  {
    id: "cotton-linen-canvas",
    name: "Cotton–Linen Canvas 240 GSM",
    subtitle: "Structured · outerwear body",
    material: "Blend",
    composition: "55% linen · 45% cotton",
    image: hero,
    gallery: [hero, linen, cotton],
    pricePerMetre: 398,
    currency: "₹",
    moq: 250,
    gsm: 240,
    widthCm: 145,
    colors: [c("Olive", "#7C8460"), c("Ecru", "#EDE6D8"), c("Ink", "#2A3242")],
    supplierId: "baltic-linen",
    rating: 4.6,
    reviews: 88,
    leadTimeDays: 14,
    availability: "In stock",
    certifications: ["GOTS"],
    sustainable: true,
    tags: ["Outerwear", "Structured", "Workwear"],
    description:
      "A dense plain-weave canvas that holds architectural shapes without interfacing. Popular for chore coats, utility overshirts and premium tote programmes.",
    stockMetres: 18240,
  },
  {
    id: "silk-cotton-voile",
    name: "Silk–Cotton Voile 68 GSM",
    subtitle: "Featherweight · semi-sheer",
    material: "Blend",
    composition: "70% cotton · 30% silk",
    image: cotton,
    gallery: [cotton, silk, hero],
    pricePerMetre: 640,
    currency: "₹",
    moq: 150,
    gsm: 68,
    widthCm: 110,
    colors: [c("Blush", "#EBD3D0"), c("Mist", "#D8E1E8"), c("Ivory", "#F6F2EA")],
    supplierId: "kanchi-silk",
    rating: 4.7,
    reviews: 61,
    leadTimeDays: 16,
    availability: "In stock",
    certifications: ["Silk Mark"],
    sustainable: false,
    tags: ["Summer", "Semi-sheer", "Layering"],
    description:
      "An airy voile with silk's cool touch and cotton's stability. Ideal for layered resort dressing, scarves and lining that needs to breathe.",
    stockMetres: 9600,
  },
  {
    id: "recycled-poly-twill",
    name: "Recycled Poly Twill 180 GSM",
    subtitle: "GRS certified · performance",
    material: "Technical",
    composition: "100% GRS recycled polyester",
    image: denim,
    gallery: [denim, wool, hero],
    pricePerMetre: 268,
    currency: "₹",
    moq: 500,
    gsm: 180,
    widthCm: 150,
    colors: [c("Black", "#14161C"), c("Storm", "#4C5563"), c("Forest", "#26453A")],
    supplierId: "arvind-weaves",
    rating: 4.5,
    reviews: 190,
    leadTimeDays: 10,
    availability: "In stock",
    certifications: ["GRS", "OEKO-TEX 100"],
    sustainable: true,
    tags: ["Performance", "Recycled", "Fast lead time"],
    description:
      "Bottle-to-fabric recycled twill with a DWR finish and 4-way mechanical stretch. Consistent shade matching across 2,000-metre production runs.",
    stockMetres: 64000,
  },
  {
    id: "herringbone-wool-flannel",
    name: "Herringbone Wool Flannel 340 GSM",
    subtitle: "Brushed · winter tailoring",
    material: "Wool",
    composition: "90% merino wool · 10% cashmere",
    image: wool,
    gallery: [wool, silk, hero],
    pricePerMetre: 2980,
    currency: "₹",
    moq: 50,
    gsm: 340,
    widthCm: 150,
    colors: [c("Graphite", "#3A3F49"), c("Camel", "#B08A5E")],
    supplierId: "milano-lana",
    rating: 4.9,
    reviews: 42,
    leadTimeDays: 30,
    availability: "Made to order",
    certifications: ["RWS"],
    sustainable: true,
    tags: ["Winter", "Cashmere blend", "Low MOQ"],
    description:
      "Softly brushed herringbone with a cashmere top note. Warm without weight, and it presses to a razor edge for structured outerwear.",
    stockMetres: 920,
  },
  {
    id: "bamboo-jersey-knit",
    name: "Bamboo Jersey Knit 160 GSM",
    subtitle: "Single knit · fluid hand",
    material: "Knit",
    composition: "95% bamboo viscose · 5% elastane",
    image: linen,
    gallery: [linen, cotton, hero],
    pricePerMetre: 324,
    currency: "₹",
    moq: 300,
    gsm: 160,
    widthCm: 180,
    colors: [c("Bone", "#EFEAE1"), c("Clay", "#C08C74"), c("Deep Sea", "#243B4A")],
    supplierId: "baltic-linen",
    rating: 4.6,
    reviews: 118,
    leadTimeDays: 13,
    availability: "In stock",
    certifications: ["OEKO-TEX 100", "FSC"],
    sustainable: true,
    tags: ["Knit", "Loungewear", "Soft hand"],
    description:
      "A closed-loop bamboo viscose jersey with exceptional recovery. Cool to the touch, low-torque, and stable through industrial laundering.",
    stockMetres: 27400,
  },
  {
    id: "jacquard-brocade",
    name: "Silk Jacquard Brocade",
    subtitle: "Hand-guided loom · heritage motif",
    material: "Silk",
    composition: "82% silk · 18% metallic zari",
    image: silk,
    gallery: [silk, hero, wool],
    pricePerMetre: 3420,
    currency: "₹",
    moq: 40,
    gsm: 210,
    widthCm: 112,
    colors: [c("Royal", "#22357A"), c("Vermilion", "#B03A2E"), c("Emerald", "#1E5945")],
    supplierId: "kanchi-silk",
    rating: 5.0,
    reviews: 37,
    leadTimeDays: 35,
    availability: "Made to order",
    certifications: ["Silk Mark"],
    sustainable: false,
    tags: ["Bridal", "Artisanal", "Limited"],
    description:
      "Woven on hand-guided jacquard looms at roughly six metres per day. Each motif is card-punched in house and archived for exact reorders.",
    stockMetres: 480,
  },
  {
    id: "hemp-cotton-chambray",
    name: "Hemp–Cotton Chambray 145 GSM",
    subtitle: "Low-impact dye · softening wash",
    material: "Blend",
    composition: "55% hemp · 45% organic cotton",
    image: cotton,
    gallery: [cotton, denim, hero],
    pricePerMetre: 356,
    currency: "₹",
    moq: 250,
    gsm: 145,
    widthCm: 147,
    colors: [c("Indigo Wash", "#5B7290"), c("Stone", "#B9BCB4")],
    supplierId: "arvind-weaves",
    rating: 4.7,
    reviews: 103,
    leadTimeDays: 14,
    availability: "In stock",
    certifications: ["GOTS", "OEKO-TEX 100"],
    sustainable: true,
    tags: ["Everyday", "Low water", "Shirting"],
    description:
      "Hemp's durability with cotton's comfort, dyed in a low-liquor-ratio bath that cuts water use by 38% against the mill's 2021 baseline.",
    stockMetres: 15800,
  },
];

export const getProduct = (id: string) => products.find((p) => p.id === id);
export const getSupplier = (id: string) => suppliers.find((s) => s.id === id);

export const materials = ["Cotton", "Silk", "Linen", "Denim", "Wool", "Blend", "Knit", "Technical"];

export const marketplaceStats = [
  { label: "Fabrics indexed", value: "Thousands+" },
  { label: "Verified suppliers", value: "1,200" },
  { label: "Countries sourced", value: "48" },
  { label: "Orders fulfilled", value: "1M+" },
];

export const brandLogos = [
  "NORDVELT",
  "Maison Cera",
  "ATELIER 9",
  "Kestrel & Co.",
  "LUMEN APPAREL",
  "Verdant Studio",
  "HÅLL",
  "Orsini Milano",
];

export const testimonials = [
  {
    quote:
      "We replaced four sourcing agents with Texora. Semantic search found a GOTS poplin at the right MOQ in eleven minutes — that used to be a three-week hunt.",
    name: "Ananya Rao",
    role: "Head of Sourcing, Nordvelt",
  },
  {
    quote:
      "The supplier verification depth is what sold our compliance team. Every certificate is traceable to the mill lot before we raise a PO.",
    name: "Marc Feld",
    role: "Supply Chain Director, Atelier 9",
  },
  {
    quote:
      "As a mill, we went from cold email to twenty-two repeat buyers in one season. The inventory sync alone saves us a full day each week.",
    name: "Giulia Orsini",
    role: "Export Manager, Milano Lana",
  },
];

export const buyerOrders = [
  {
    id: "LM-48213",
    product: "Organic Cotton Poplin 120 GSM",
    supplier: "Arvind Weaving House",
    qty: 1800,
    total: 381600,
    status: "In transit",
    placed: "12 Jul 2026",
    eta: "29 Jul 2026",
  },
  {
    id: "LM-48160",
    product: "European Flax Linen 185 GSM",
    supplier: "Baltic Linen Works",
    qty: 900,
    total: 437400,
    status: "Preparing",
    placed: "08 Jul 2026",
    eta: "02 Aug 2026",
  },
  {
    id: "LM-47992",
    product: "Super 130s Wool Suiting",
    supplier: "Milano Lana Tessuti",
    qty: 240,
    total: 542400,
    status: "Completed",
    placed: "18 Jun 2026",
    eta: "Delivered 09 Jul",
  },
  {
    id: "LM-47844",
    product: "Recycled Poly Twill 180 GSM",
    supplier: "Arvind Weaving House",
    qty: 4000,
    total: 1072000,
    status: "Completed",
    placed: "02 Jun 2026",
    eta: "Delivered 21 Jun",
  },
];

export const revenueSeries = [
  { month: "Feb", revenue: 3820000, orders: 42 },
  { month: "Mar", revenue: 4460000, orders: 51 },
  { month: "Apr", revenue: 4180000, orders: 47 },
  { month: "May", revenue: 5640000, orders: 63 },
  { month: "Jun", revenue: 6320000, orders: 71 },
  { month: "Jul", revenue: 7480000, orders: 84 },
];

export const categoryMix = [
  { name: "Cotton", value: 38 },
  { name: "Linen", value: 24 },
  { name: "Wool", value: 18 },
  { name: "Silk", value: 12 },
  { name: "Technical", value: 8 },
];

export const supplierOrders = [
  { id: "LM-48219", buyer: "Nordvelt Apparel", product: "Organic Cotton Poplin", qty: 2400, value: 508800, stage: "Pending" },
  { id: "LM-48214", buyer: "Kestrel & Co.", product: "Hemp–Cotton Chambray", qty: 1200, value: 427200, stage: "Pending" },
  { id: "LM-48201", buyer: "Maison Cera", product: "Selvedge Denim 13.5 oz", qty: 800, value: 593600, stage: "Accepted" },
  { id: "LM-48188", buyer: "Lumen Apparel", product: "Recycled Poly Twill", qty: 5000, value: 1340000, stage: "Accepted" },
  { id: "LM-48170", buyer: "Verdant Studio", product: "Organic Cotton Poplin", qty: 1500, value: 318000, stage: "Preparing" },
  { id: "LM-48155", buyer: "Atelier 9", product: "Silk–Cotton Voile", qty: 600, value: 384000, stage: "Preparing" },
  { id: "LM-48142", buyer: "Håll Studio", product: "Bamboo Jersey Knit", qty: 2200, value: 712800, stage: "Dispatch" },
  { id: "LM-48120", buyer: "Orsini Milano", product: "Super 130s Wool Suiting", qty: 300, value: 678000, stage: "Dispatch" },
  { id: "LM-48098", buyer: "Nordvelt Apparel", product: "European Flax Linen", qty: 1800, value: 874800, stage: "Completed" },
  { id: "LM-48061", buyer: "Kestrel & Co.", product: "Cotton–Linen Canvas", qty: 3000, value: 1194000, stage: "Completed" },
];

export const orderStages = ["Pending", "Accepted", "Preparing", "Dispatch", "Completed"] as const;
export type OrderStage = (typeof orderStages)[number];

export const inr = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
