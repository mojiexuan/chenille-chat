import { Parser } from "./parser";
import { parserRegistry } from "./parser-registry";
import { textParser } from "./text.parser";
import { imageParser } from "./image.parser";

/**
 * 注册解析器
 */
parserRegistry.register(textParser);
parserRegistry.register(imageParser);

/**
 * 导出解析器注册器
 */
export { Parser, parserRegistry };



