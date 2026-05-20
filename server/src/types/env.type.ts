import type { schema } from "@/config";

export type EnvSchema = Record<string, string | undefined>;

export type Config = Readonly<{
  [K in keyof typeof schema]: string;
}>;
