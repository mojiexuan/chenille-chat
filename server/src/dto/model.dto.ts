import z from "zod/v4";

export const modelByProviderIdDto = z.object({
    providerId: z.coerce.number().optional(),
});

export type ModelByProviderIdDto = z.infer<typeof modelByProviderIdDto>;
