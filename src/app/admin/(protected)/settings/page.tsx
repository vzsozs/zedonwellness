import { getEurHufRate } from "@/lib/settings";
import { ExchangeRateForm } from "./exchange-rate-form";

export default async function SettingsPage() {
  const rate = await getEurHufRate();

  return (
    <div>
      <h1 className="mb-8 text-2xl font-semibold">Beállítások</h1>
      <ExchangeRateForm currentRate={rate} />
    </div>
  );
}
