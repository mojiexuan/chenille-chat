import { ParsedDocument } from "@/types";

export interface Parser {
    supports(file: File): boolean;

    parse(file: File): Promise<ParsedDocument>;
}