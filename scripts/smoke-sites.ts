import { dictionaries } from "../src/i18n/dictionaries";
import { getToolCopy } from "../src/i18n/tools";
import { kitTools, tools } from "../src/tools/registry";

const web = tools.filter((t) => t.surface === "web");
console.log("builtins", kitTools.filter((t) => t.kind === "builtin").length);
console.log("web", web.length);

const samples = [
  "web-10minutemail-com",
  "web-1password-com",
  "web-3f-dk",
  "web-9to5mac-com",
  "facebook",
  "web-aa-com",
];
for (const id of samples) {
  const c = getToolCopy(dictionaries.da, id);
  console.log(`${id} -> ${c.name} | ${c.description}`);
}
