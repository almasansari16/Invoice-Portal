/**
 * Loads realistic demo data: company profile, customers and ~24 invoices
 * spread over the last 6 months (mix of PKR/USD, Sea/Air/Road, all statuses).
 *
 * Run with: npm run db:seed:demo
 * Safe to re-run — it skips if the demo customers already exist.
 * Run `npm run db:seed` first so the admin user exists.
 */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const CUSTOMERS = [
  { name: "Khalid Al Mansoori", company: "Al Noor Trading LLC", email: "khalid@alnoortrading.ae", phone: "+971 4 887 2210", address: "Warehouse 7, Al Quoz Industrial Area 3", city: "Dubai", country: "UAE", taxNumber: "TRN 100384729100003", notes: "Main consignee for Jebel Ali FCL shipments." },
  { name: "Faisal Mehmood", company: "Brightwave Textiles (Pvt) Ltd", email: "accounts@brightwavetex.pk", phone: "+92 41 874 3300", address: "Plot 88, M-3 Industrial City", city: "Faisalabad", country: "Pakistan", taxNumber: "3910287-6", notes: "30-day credit. Weekly road shipments Faisalabad ↔ Karachi." },
  { name: "James Whitfield", company: "Crescent Apparel UK Ltd", email: "j.whitfield@crescentapparel.co.uk", phone: "+44 20 7946 0321", address: "Unit 4, Heathrow Logistics Park, Bath Road", city: "London", country: "United Kingdom", taxNumber: "GB 284 5519 07", notes: "Air freight, invoices in USD." },
  { name: "Sana Baloch", company: "Indus Agro Exports", email: "sana@indusagro.com.pk", phone: "+92 21 3512 7740", address: "Office 1102, Business Centre, Shahrah-e-Faisal", city: "Karachi", country: "Pakistan", taxNumber: "4210673-1", notes: "Imports machinery parts via Port Qasim." },
  { name: "Usman Tariq", company: "Sialkot Sports Works", email: "usman@sialkotsports.pk", phone: "+92 52 426 1188", address: "Kashmir Road, Near Allama Iqbal Chowk", city: "Sialkot", country: "Pakistan", taxNumber: "3602211-4", notes: "Seasonal peak Aug–Oct (football exports)." },
  { name: "Erik Lindqvist", company: "Nordic Home Interiors AB", email: "erik.lindqvist@nordichome.se", phone: "+46 31 780 4412", address: "Lindholmspiren 9", city: "Gothenburg", country: "Sweden", taxNumber: "SE 556712-3345", notes: "Home textiles, LCL and FCL via Hamburg." },
  { name: "Bilal Ahmed", company: "Pak-China Machinery Co.", email: "bilal@pakchinamachinery.com", phone: "+92 42 3589 6620", address: "14-B, Quaid-e-Azam Industrial Estate, Kot Lakhpat", city: "Lahore", country: "Pakistan", taxNumber: "3520984-2", notes: "Imports from Shanghai/Ningbo." },
  { name: "Ayesha Khan", company: "Zameen Pharma Distributors", email: "ayesha.khan@zameenpharma.pk", phone: "+92 51 227 9034", address: "Plot 31, I-9/2 Industrial Area", city: "Islamabad", country: "Pakistan", taxNumber: "1730542-9", notes: "Temperature-controlled road shipments." },
];

// shipment + line-item recipes
const JOBS = {
  seaExport: {
    currency: "USD", rate: 278.5, mode: "Sea", tax: 0,
    routes: [["Karachi (PKKHI)", "Jebel Ali (AEJEA)"], ["Karachi (PKKHI)", "Hamburg (DEHAM)"], ["Port Qasim (PKBQM)", "Felixstowe (GBFXT)"]],
    items: (r) => [
      ["Ocean Freight — 40' HC container", r(1, 3), r(1100, 1450)],
      ["Terminal Handling Charges (THC)", "same", 155],
      ["Bill of Lading Fee", 1, 75],
      ["Export Customs Clearance", 1, 185],
    ],
    weight: () => `${(Math.round(rand(16, 26) * 1000)).toLocaleString("en-US")} kg`,
  },
  air: {
    currency: "USD", rate: 279.2, mode: "Air", tax: 0,
    routes: [["Lahore (LHE)", "London Heathrow (LHR)"], ["Karachi (KHI)", "Frankfurt (FRA)"], ["Sialkot (SKT)", "Dubai (DXB)"]],
    items: (r) => {
      const kg = r(120, 650);
      return [
        ["Air Freight Charges (per kg)", kg, pick([3.6, 3.85, 4.1])],
        ["Fuel Surcharge (per kg)", kg, 0.65],
        ["Security Screening", 1, 45],
        ["Air Waybill (AWB) Fee", 1, 35],
      ];
    },
    weight: null,
  },
  road: {
    currency: "PKR", rate: null, mode: "Road", tax: 16,
    routes: [["Karachi (SITE Area)", "Lahore (Sundar Industrial Estate)"], ["Faisalabad (M-3 City)", "Karachi (Port Qasim)"], ["Karachi (Korangi)", "Islamabad (I-9)"]],
    items: (r) => [
      ["40ft Trailer Haulage", 1, r(165, 210) * 1000],
      ["Loading / Unloading Labour", 1, 12500],
      ["Motorway Tolls & Route Tax", 1, 8400],
      ["Warehouse Storage (per day)", r(1, 4), 4500],
    ],
    weight: () => `${(Math.round(rand(12, 24) * 1000)).toLocaleString("en-US")} kg`,
  },
  customs: {
    currency: "PKR", rate: null, mode: "Sea", tax: 15,
    routes: [["Shanghai (CNSHA)", "Port Qasim (PKBQM)"], ["Ningbo (CNNGB)", "Karachi (PKKHI)"]],
    items: (r) => [
      ["Customs Clearance & Agency Fee", 1, 35000],
      ["Delivery Order (DO) Charges", 1, 18500],
      ["Container Examination Charges", 1, 7500],
      ["Port Handling & Lift-on/Lift-off", 1, 14200],
      ["Local Transport to Warehouse", 1, r(22, 34) * 1000],
    ],
    weight: () => `${(Math.round(rand(9, 22) * 1000)).toLocaleString("en-US")} kg`,
  },
};

// which customer gets which kind of job
const CUSTOMER_JOBS = {
  "Al Noor Trading LLC": "seaExport",
  "Brightwave Textiles (Pvt) Ltd": "road",
  "Crescent Apparel UK Ltd": "air",
  "Indus Agro Exports": "customs",
  "Sialkot Sports Works": "air",
  "Nordic Home Interiors AB": "seaExport",
  "Pak-China Machinery Co.": "customs",
  "Zameen Pharma Distributors": "road",
};

// deterministic PRNG so every run produces the same data set
let seed = 20260928;
function rnd() {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
}
function rand(a, b) { return a + rnd() * (b - a); }
function randInt(a, b) { return Math.floor(rand(a, b + 1)); }
function pick(arr) { return arr[Math.floor(rnd() * arr.length)]; }
function round2(n) { return Math.round(n * 100) / 100; }
function daysAgo(n) {
  const d = new Date();
  d.setHours(10, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}
function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

async function main() {
  const exists = await prisma.customer.findFirst({ where: { email: CUSTOMERS[0].email } });
  if (exists) {
    console.log("Demo data already present — nothing to do.");
    return;
  }

  // company profile: only fill in if still on defaults
  let settings = await prisma.companySettings.findFirst();
  const profile = {
    companyName: "Harbourline Logistics (Pvt) Ltd",
    address: "Suite 804, Clifton Centre, Block 5, Clifton\nKarachi 75600, Pakistan",
    phone: "+92 21 3587 4410",
    email: "billing@harbourline.pk",
    website: "www.harbourline.pk",
    taxNumber: "4218836-7",
    bankDetails: "Bank: Meezan Bank Ltd — Clifton Branch\nAccount title: Harbourline Logistics (Pvt) Ltd\nIBAN (PKR): PK36 MEZN 0001 0101 0045 8812\nIBAN (USD): PK81 MEZN 0001 0101 0045 8830\nSWIFT: MEZNPKKA",
    footerNote: "Thank you for shipping with Harbourline Logistics. Please quote the invoice number with your payment.",
  };
  if (!settings) {
    settings = await prisma.companySettings.create({ data: { ...profile, invoicePrefix: "INV" } });
  } else if (settings.companyName === "Your Company") {
    settings = await prisma.companySettings.update({ where: { id: settings.id }, data: profile });
  }

  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });

  const customers = [];
  for (const c of CUSTOMERS) customers.push(await prisma.customer.create({ data: c }));
  console.log(`Created ${customers.length} customers.`);

  // build invoice plan: ~24 invoices over the last ~170 days, newest last
  const plan = [];
  for (let i = 0; i < 24; i++) {
    const age = Math.round(170 - i * 7.2 + rand(-2, 2));
    plan.push({ age: Math.max(age, 0), customer: customers[i % customers.length] });
  }

  let next = settings.nextNumber;
  const year = new Date().getFullYear();
  let created = 0;

  for (const { age, customer } of plan) {
    const job = JOBS[CUSTOMER_JOBS[customer.company]];
    const [origin, destination] = pick(job.routes);
    const invoiceDate = daysAgo(age);
    const termDays = job.currency === "USD" ? 30 : 15;
    const dueDate = addDays(invoiceDate, termDays);

    let lastQty = 1;
    const items = job.items(randInt).map(([description, q, price], idx) => {
      const quantity = q === "same" ? lastQty : q;
      lastQty = quantity;
      return {
        description,
        quantity,
        unitPrice: price,
        amount: round2(quantity * price),
        sortOrder: idx,
      };
    });

    const subtotal = round2(items.reduce((s, i) => s + i.amount, 0));
    const discount = rnd() < 0.2 ? (job.currency === "USD" ? 50 : 5000) : 0;
    const afterDiscount = Math.max(subtotal - discount, 0);
    const taxAmount = round2((afterDiscount * job.tax) / 100);
    const total = round2(afterDiscount + taxAmount);

    // status by age: old ones mostly paid, a few overdue, recent ones sent/draft
    let status;
    let amountPaid = 0;
    const overdueNow = dueDate < new Date();
    const roll = rnd();
    if (age > 45) {
      status = roll < 0.8 ? "PAID" : roll < 0.93 ? "OVERDUE" : "CANCELLED";
    } else if (age > 10) {
      status = overdueNow ? (roll < 0.55 ? "PAID" : "OVERDUE") : roll < 0.45 ? "PAID" : "SENT";
    } else {
      status = roll < 0.35 ? "DRAFT" : roll < 0.85 ? "SENT" : "PAID";
    }
    if (status === "PAID") amountPaid = total;
    if (status === "OVERDUE" && rnd() < 0.4) amountPaid = round2(total * 0.5);
    if (status === "SENT" && job.currency === "PKR" && rnd() < 0.3) amountPaid = round2(total * 0.5);

    const invoiceNumber = `${settings.invoicePrefix}-${year}-${String(next).padStart(6, "0")}`;
    next += 1;

    await prisma.invoice.create({
      data: {
        invoiceNumber,
        invoiceDate,
        dueDate,
        customerId: customer.id,
        createdById: admin ? admin.id : null,
        originPort: origin,
        destinationPort: destination,
        shipmentMode: job.mode,
        containerNo:
          job.mode === "Air" ? null : `${pick(["MSCU", "CMAU", "MAEU", "TGHU", "OOLU"])} ${randInt(100000, 999999)}-${randInt(0, 9)}`,
        trackingNo:
          job.mode === "Air"
            ? `AWB ${pick(["214", "176", "157"])}-${randInt(10000000, 99999999)}`
            : job.mode === "Road"
            ? `TRK-${randInt(1000, 9999)}`
            : `${pick(["MEDU", "CMDU", "MAEU"])}${randInt(1000000, 9999999)}`,
        weight: job.weight ? job.weight() : `${items[0].quantity} kg (chargeable)`,
        shippingDate: addDays(invoiceDate, -randInt(0, 4)),
        currency: job.currency,
        exchangeRate: job.rate,
        status,
        subtotal,
        discount,
        taxPercent: job.tax,
        taxAmount,
        total,
        amountPaid,
        notes: `${job.mode} shipment from ${origin} to ${destination}.`,
        terms: `Payment due within ${termDays} days of invoice date. Please quote the invoice number with your payment.`,
        items: { create: items },
      },
    });
    created += 1;
  }

  await prisma.companySettings.update({ where: { id: settings.id }, data: { nextNumber: next } });
  console.log(`Created ${created} invoices. Next invoice number: ${next}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
