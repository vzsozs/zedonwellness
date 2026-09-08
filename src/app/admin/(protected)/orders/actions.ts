"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";
import { type ActionState, toActionError } from "@/lib/action-state";
import { ORDER_STATUSES } from "./order-status";

const schema = z.object({
  id: z.coerce.number().int().positive(),
  status: z.enum(ORDER_STATUSES),
});

export async function updateOrderStatus(
  id: number,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdmin();
    const parsed = schema.parse({ id, status: formData.get("status") });
    await db
      .update(orders)
      .set({ status: parsed.status })
      .where(eq(orders.id, parsed.id));
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${parsed.id}`);
    return {};
  } catch (err) {
    return toActionError(err);
  }
}
