// Ready-made invoice templates used by the "Fill sample data" menu on the invoice form.
// Handy for demos, training and quickly testing the invoicing flow.

export type SampleTemplate = {
  key: string;
  title: string;
  subtitle: string;
  billNo?: string;
  mode: "Sea" | "Air" | "Road" | "";
  customerHints: string[];
  currency: "USD" | "PKR";
  foreignCurrency?: "EUR" | "USD" | string;
  exchangeRate: number | null;
  status: string;
  dueInDays: number;
  shippedDaysAgo: number;
  shipper?: string;
  consignee?: string;
  originPort?: string;
  destinationPort?: string;
  masterAwb?: string;
  houseAwb?: string;
  hblNo?: string;
  mblNo?: string;
  containerNo?: string;
  vesselName?: string;
  packages?: string;
  chargeableWeight?: string;
  grossWeight?: string;
  cbm?: string;
  trackingNo?: string;
  weight?: string;
  discount: number;
  taxPercent: number;
  amountPaid: number;
  notes: string;
  terms: string;
  items: {
    description: string;
    rate?: number;
    foreignAmount?: number;
    quantity: number;
    unitPrice: number;
    amount?: number;
  }[];
};

export const SAMPLE_TEMPLATES: SampleTemplate[] = [
  {
    key: "air-nova",
    title: "Air Freight (AF-7860256)",
    subtitle: "FERIHEGY (BUD) → KARACHI (KHI) · EUR / PKR",
    billNo: "AF-7860256",
    mode: "Air",
    customerHints: ["Nova", "Leathers", "Omar", "Siddiqui"],
    currency: "PKR",
    foreignCurrency: "EUR",
    exchangeRate: 326.0,
    status: "SENT",
    dueInDays: 7,
    shippedDaysAgo: 55,
    shipper: "HELSA KONFEKCIOIPARI KFT",
    consignee: "NOVA LEATHERS (PVT) LTD.\nPLOT 30, SECTOR 15, KORANGI\nINDUSTRIAL AREA. KARACHI PAKISTAN",
    originPort: "FERIHEGY (BUD)",
    destinationPort: "KARACHI (KHI)",
    masterAwb: "176-61185283",
    houseAwb: "SAE26080119",
    packages: "32",
    chargeableWeight: "627",
    grossWeight: "160",
    cbm: "",
    discount: 0,
    taxPercent: 0,
    amountPaid: 0,
    notes: "",
    terms: "1. If any Discrepancy in this invoice must be notified within 7 days to us, from the date of receipt, after that no claim shall be entertained.\n2. Kindly clear your payments within approved credit days to avoid finical charges.\n3. Cheque, Pay order or Demand Draft must in Favor of \"Sky logistics Solutions\".",
    items: [
      { description: "AIR FREIGHT", rate: 3.75, foreignAmount: 2351.25, quantity: 1, unitPrice: 766507.5, amount: 766507.5 },
      { description: "DO FEE", rate: 10500.0, foreignAmount: undefined, quantity: 1, unitPrice: 10500.0, amount: 10500.0 },
      { description: "ExWork", rate: 355.0, foreignAmount: 355.0, quantity: 1, unitPrice: 115730.0, amount: 115730.0 },
    ],
  },
  {
    key: "sea-autobio",
    title: "Sea Freight (SF-7860259)",
    subtitle: "SHANGHAI (CNSHA) → KARACHI (KHI) · USD / PKR",
    billNo: "SF-7860259",
    mode: "Sea",
    customerHints: ["Sure Bio", "Diagnostics", "Pharmaceuticals", "Becker", "Qureshi"],
    currency: "PKR",
    foreignCurrency: "USD",
    exchangeRate: 278.5,
    status: "SENT",
    dueInDays: 7,
    shippedDaysAgo: 20,
    shipper: "AUTOBIO DIAGNOSTICS CO. LTD",
    consignee: "SURE BIO DIAGNOSTICS\nPHARMACEUTICALS\nSEE 10 DEFENCE VIEW PHASE 2",
    originPort: "SHANGHAI (CNSHA)",
    destinationPort: "KARACHI (KHI)",
    hblNo: "4/PKAR26082050",
    packages: "4",
    chargeableWeight: "",
    grossWeight: "596",
    cbm: "4.22",
    discount: 0,
    taxPercent: 0,
    amountPaid: 0,
    notes: "",
    terms: "1. If any Discrepancy in this invoice must be notified within 7 days to us, from the date of receipt, after that no claim shall be entertained.\n2. Kindly clear your payments within approved credit days to avoid finical charges.\n3. Cheque, Pay order or Demand Draft must in Favor of \"Sky logistics Solutions\".",
    items: [
      { description: "ALL IN CHARGES", rate: 1200.0, foreignAmount: 1200.0, quantity: 1, unitPrice: 334200.0, amount: 334200.0 },
      { description: "DO FEE", rate: 10500.0, foreignAmount: undefined, quantity: 1, unitPrice: 10500.0, amount: 10500.0 },
      { description: "THC", rate: 483.0, foreignAmount: undefined, quantity: 1, unitPrice: 2038.66, amount: 2038.66 },
      { description: "DG DESTINATION CHARGES", rate: 5500.0, foreignAmount: undefined, quantity: 1, unitPrice: 5500.0, amount: 5500.0 },
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
      { description: "Air Freight Charges (per kg)", quantity: 480, unitPrice: 3.85, amount: 1848 },
      { description: "Fuel Surcharge (per kg)", quantity: 480, unitPrice: 0.65, amount: 312 },
      { description: "Security Screening", quantity: 1, unitPrice: 45, amount: 45 },
      { description: "Air Waybill (AWB) Fee", quantity: 1, unitPrice: 35, amount: 35 },
      { description: "Export Documentation", quantity: 1, unitPrice: 60, amount: 60 },
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
      { description: "40ft Trailer Haulage — Karachi to Lahore", quantity: 1, unitPrice: 185000, amount: 185000 },
      { description: "Loading / Unloading Labour", quantity: 1, unitPrice: 12500, amount: 12500 },
      { description: "Motorway Tolls & Route Tax", quantity: 1, unitPrice: 8400, amount: 8400 },
      { description: "Warehouse Storage (per day)", quantity: 3, unitPrice: 4500, amount: 13500 },
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
      { description: "Customs Clearance & Agency Fee", quantity: 1, unitPrice: 35000, amount: 35000 },
      { description: "Delivery Order (DO) Charges", quantity: 1, unitPrice: 18500, amount: 18500 },
      { description: "Container Examination Charges", quantity: 1, unitPrice: 7500, amount: 7500 },
      { description: "Port Handling & Lift-on/Lift-off", quantity: 1, unitPrice: 14200, amount: 14200 },
      { description: "Transport — Port Qasim to Korangi", quantity: 1, unitPrice: 28000, amount: 28000 },
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
