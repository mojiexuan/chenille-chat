import z from "zod/v4";

export const paginationRequestDto = z.object({
    page: z.coerce.number().int().min(1, "分页页码不能小于1").default(1),
    pageSize: z.coerce.number().int().min(1, "分页每页数量不能小于1").default(20),
});

export type PaginationRequest = z.infer<typeof paginationRequestDto>;
