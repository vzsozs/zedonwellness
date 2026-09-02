"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { setEurHufRate } from "@/lib/settings";
import { fetchMnbEurHufRate } from "@/lib/mnb";
import { type ActionState, toActionError } from "@/lib/action-state";

const schema = z.object({
  eurHufRate: z.coerce.number().positive("Az árfolyamnak pozitív számnak kell lennie."),
});

export async function updateExchangeRate(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { eurHufRate } = schema.parse({ eurHufRate: formData.get("eurHufRate") });
    await setEurHufRate(eurHufRate);
    revalidatePath("/admin/settings");
    revalidatePath("/admin/extras");
    revalidatePath("/admin/products");
    revalidatePath("/", "layout");
    return {};
  } catch (err) {
    return toActionError(err);
  }
}

export type MnbFetchState = { error?: string; rate?: number };

export async function fetchExchangeRateFromMnb(): Promise<MnbFetchState> {
  try {
    const rate = await fetchMnbEurHufRate();
    await setEurHufRate(rate);
    revalidatePath("/admin/settings");
    revalidatePath("/admin/extras");
    revalidatePath("/admin/products");
    revalidatePath("/", "layout");
    return { rate };
  } catch (err) {
    return toActionError(err);
  }
}
