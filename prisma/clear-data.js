const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function clearData() {
  console.log("Clearing all invoice items, invoices, and customers...");

  const deletedItems = await prisma.invoiceItem.deleteMany({});
  console.log(`Deleted ${deletedItems.count} invoice items.`);

  const deletedInvoices = await prisma.invoice.deleteMany({});
  console.log(`Deleted ${deletedInvoices.count} invoices.`);

  const deletedCustomers = await prisma.customer.deleteMany({});
  console.log(`Deleted ${deletedCustomers.count} customers.`);

  // Reset next invoice number counter back to 1
  const settings = await prisma.companySettings.findFirst();
  if (settings) {
    await prisma.companySettings.update({
      where: { id: settings.id },
      data: { nextNumber: 1 },
    });
    console.log("Reset invoice counter to 1.");
  }

  console.log("Cleanup complete. Admin user and Company Settings are preserved.");
}

clearData()
  .catch((e) => {
    console.error("Error clearing data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
