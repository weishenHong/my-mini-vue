import { baseCompiler } from "./compiler-core/src/compiler";

export * from "./runtime-dom/index";
import { registerRuntimeCompiler } from "./runtime-dom/index";
export { baseCompiler } from "./compiler-core/src/index";
import * as runtimeDom from "./runtime-dom/index";

function compilerToFunction(template: any) {
  const { code } = baseCompiler(template);
  const render = new Function("Vue", code)(runtimeDom);
  return render;
}
registerRuntimeCompiler(compilerToFunction);
