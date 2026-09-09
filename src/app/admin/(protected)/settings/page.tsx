import { getEurHufRate } from "@/lib/settings";
import { ExchangeRateForm } from "./exchange-rate-form";
import { OrphanUploads } from "./orphan-uploads";

export default async function SettingsPage() {
  const rate = await getEurHufRate();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold">Beállítások</h1>
      <ExchangeRateForm currentRate={rate} />
      <OrphanUploads />
    </div>
  );
}
