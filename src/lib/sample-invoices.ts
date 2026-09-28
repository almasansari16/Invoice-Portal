// Ready-made invoice templates used by the "Fill sample data" menu on the invoice form.
// Handy for demos, training and quickly testing the invoicing flow.

export type SampleTemplate = {
  key: string;
  title: string;
  subtitle: string;
  mode: "Sea" | "Air" | "Road" | "";
  // picks the first customer whose name/company contains one of these words
  customerHints: string[];
  currency: "USD" | "PKR";
  exchangeRate: number | null;
  status: string;
  dueInDays: number;
  shippedDaysAgo: number;
  originPort: string;
  destinationPort: string;
  containerNo: string;
  trackingNo: string;
  weight: string;
  discount: number;
  taxPercent: number;
  amountPaid: number;
  notes: string;
  terms: string;
  items: { description: string; quantity: number; unitPrice: number }[];
};

export const SAMPLE_TEMPLATES: SampleTemplate[] = [
  {
    key: "sea-fcl",
    title: "Sea freight · FCL export",
    subtitle: "Karachi → Jebel Ali, 2 × 40' HC, USD",
    mode: "Sea",
    customerHints: ["Al Noor", "Dubai", "Trading"],
    currency: "USD",
    exchangeRate: 278.5,
    status: "SENT",
    dueInDays: 30,
    shippedDaysAgo: 2,
    originPort: "Karachi (PKKHI)",
    destinationPort: "Jebel Ali (AEJEA)",
    containerNo: "MSCU 482913-7, MSCU 482956-2",
    trackingNo: "MEDUKH2409183",
    weight: "38,400 kg",
    discount: 50,
    taxPercent: 0,
    amountPaid: 0,
    notes: "2 × 40' High Cube containers — textiles (HS 6302). Vessel MSC AURORA V.428W.",
    terms: "Payment due within 30 days. Late payments attract 1.5% monthly surcharge. Freight rates valid for this shipment only.",
    items: [
      { description: "Ocean Freight — 40' HC container", quantity: 2, unitPrice: 1225 },
      { description: "Terminal Handling Charges (THC)", quantity: 2, unitPrice: 155 },
      { description: "Bill of Lading Fee", quantity: 1, unitPrice: 75 },
      { description: "Export Customs Clearance", quantity: 1, unitPrice: 185 },
      { description: "Cargo Insurance (0.3% of CIF)", quantity: 1, unitPrice: 120 },
    ],
  },
  {
    key: "air",
    title: "Air freight · Express",
    subtitle: "Lahore → London Heathrow, 480 kg, USD",
    mode: "Air",
    customerHints: ["Crescent", "UK", "London", "Apparel"],
    currency: "USD",
    exchangeRate: 278.5,
    status: "DRAFT",
    dueInDays: 15,
    shippedDaysAgo: 0,
    originPort: "Lahore (LHE)",
    destinationPort: "London Heathrow (LHR)",
    containerNo: "",
    trackingNo: "AWB 214-58830142",
    weight: "480 kg (chargeable)",
    discount: 0,
    taxPercent: 0,
    amountPaid: 0,
    notes: "32 cartons — ready-made garments. Flight PK-757, priority handling requested.",
    terms: "Payment due within 15 days of invoice date. Chargeable weight is the greater of actual and volumetric weight.",
    items: [
      { description: "Air Freight Charges (per kg)", quantity: 480, unitPrice: 3.85 },
      { description: "Fuel Surcharge (per kg)", quantity: 480, unitPrice: 0.65 },
      { description: "Security Screening", quantity: 1, unitPrice: 45 },
      { description: "Air Waybill (AWB) Fee", quantity: 1, unitPrice: 35 },
      { description: "Export Documentation", quantity: 1, unitPrice: 60 },
    ],
  },
  {
    key: "road",
    title: "Road haulage · Domestic",
    subtitle: "Karachi → Lahore, 40ft trailer, PKR + 16% tax",
    mode: "Road",
    customerHints: ["Brightwave", "Textile", "Faisalabad", "Lahore"],
    currency: "PKR",
    exchangeRate: null,
    status: "SENT",
    dueInDays: 15,
    shippedDaysAgo: 3,
    originPort: "Karachi (SITE Area)",
    destinationPort: "Lahore (Sundar Industrial Estate)",
    containerNo: "TGHU 771204-5",
    trackingNo: "TRK-KHI-LHE-0915",
    weight: "22,000 kg",
    discount: 5000,
    taxPercent: 16,
    amountPaid: 100000,
    notes: "Vehicle JU-4471, driver Muhammad Aslam (0300-1234567). Delivered in 2 days.",
    terms: "50% advance received. Balance due within 15 days of delivery. Detention charged at Rs 6,000/day after 24 free hours.",
    items: [
      { description: "40ft Trailer Haulage — Karachi to Lahore", quantity: 1, unitPrice: 185000 },
      { description: "Loading / Unloading Labour", quantity: 1, unitPrice: 12500 },
      { description: "Motorway Tolls & Route Tax", quantity: 1, unitPrice: 8400 },
      { description: "Warehouse Storage (per day)", quantity: 3, unitPrice: 4500 },
    ],
  },
  {
    key: "customs",
    title: "Import customs clearance",
    subtitle: "Port Qasim import, PKR + 15% tax",
    mode: "Sea",
    customerHints: ["Indus", "Agro", "Karachi", "Pharma"],
    currency: "PKR",
    exchangeRate: null,
    status: "DRAFT",
    dueInDays: 7,
    shippedDaysAgo: 5,
    originPort: "Shanghai (CNSHA)",
    destinationPort: "Port Qasim (PKBQM)",
    containerNo: "CMAU 339120-4",
    trackingNo: "GD-KPPI-HC-48821",
    weight: "18,750 kg",
    discount: 0,
    taxPercent: 15,
    amountPaid: 0,
    notes: "Import of agricultural machinery parts. Goods Declaration filed via WeBOC.",
    terms: "Duties and taxes paid on behalf of the client are reimbursable at actuals. Payment due within 7 days.",
    items: [
      { description: "Customs Clearance & Agency Fee", quantity: 1, unitPrice: 35000 },
      { description: "Delivery Order (DO) Charges", quantity: 1, unitPrice: 18500 },
      { description: "Container Examination Charges", quantity: 1, unitPrice: 7500 },
      { description: "Port Handling & Lift-on/Lift-off", quantity: 1, unitPrice: 14200 },
      { description: "Transport — Port Qasim to Korangi", quantity: 1, unitPrice: 28000 },
    ],
  },
];

// Common charges offered as one-click chips in the line-items section.
export const QUICK_CHARGES: { label: string; usd: number; pkr: number }[] = [
  { label: "Ocean Freight", usd: 1200, pkr: 330000 },
  { label: "Air Freight (per kg)", usd: 3.85, pkr: 1050 },
  { label: "Terminal Handling (THC)", usd: 155, pkr: 42000 },
  { label: "Customs Clearance", usd: 185, pkr: 35000 },
  { label: "Documentation Fee", usd: 60, pkr: 15000 },
  { label: "Local Trucking / Delivery", usd: 150, pkr: 28000 },
  { label: "Cargo Insurance", usd: 120, pkr: 25000 },
  { label: "Warehouse Storage (per day)", usd: 18, pkr: 4500 },
];
