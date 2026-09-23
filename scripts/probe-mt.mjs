import { translateText } from "./lib/translate.mjs";

const samples = [
  ["es", "What can you expect?\n– 1 website\n– 24/7 monitoring & support"],
  [
    "it",
    "Pro Support is for businesses with one WordPress website that want a dependable technical foundation without having to solve every issue themselves.",
  ],
  ["fr", "Collaboration"],
];

for (const [loc, t] of samples) {
  const out = await translateText(t, loc, "en");
  console.log(loc, out === t ? "ECHO/FAIL" : "OK", JSON.stringify(out.slice(0, 100)));
}
