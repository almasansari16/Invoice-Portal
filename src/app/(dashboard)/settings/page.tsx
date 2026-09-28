import { prisma } from "@/lib/prisma";
import SettingsForm from "@/components/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  let settings = await prisma.companySettings.findFirst();
  if (!settings) {
    settings = await prisma.companySettings.create({ data: { companyName: "Your Company" } });
  }

  return (
    <div>
      <div className="topbar">
        <div>
          <h1 className="page-title">Company Settings</h1>
          <p className="page-subtitle">Logo, contact details and invoice preferences</p>
        </div>
      </div>
      <SettingsForm initial={JSON.parse(JSON.stringify(settings))} />
    </div>
  );
}
