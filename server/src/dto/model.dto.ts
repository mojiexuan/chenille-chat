import z from "zod/v4";

export const modelByProviderIdDto = z.object({
  providerId: z.string().trim().min(1, "提供者ID不能为空"),
});

export type ModelByProviderIdDto = z.infer<typeof modelByProviderIdDto>;
