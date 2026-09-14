import { readFileSync } from "node:fs";

const prod = JSON.parse(readFileSync("src/content/fixweb/product-i18n-pack.json", "utf8"));
const text = prod.en["basic-support"].description;
console.log("src len", text.length);

async function tryDict() {
  const url = `https://translate.googleapis.com/translate_a/single?client=dict-chrome-ex&sl=en&tl=es&dt=t&q=${encodeURIComponent(text.slice(0, 4500))}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    signal: AbortSignal.timeout(25000),
  });
  console.log("dict status", res.status);
  const data = await res.json();
  console.log("dict json slice", JSON.stringify(data).slice(0, 400));
  if (Array.isArray(data?.[0])) {
    console.log("joined", data[0].map((x) => x?.[0]).join("").slice(0, 200));
  }
}

async function tryC5() {
  const url = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&dt=t&sl=en&tl=es&q=${encodeURIComponent(text.slice(0, 4500))}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
    signal: AbortSignal.timeout(25000),
  });
  console.log("c5 status", res.status);
  const data = await res.json();
  console.log("c5 json slice", JSON.stringify(data).slice(0, 400));
}

async function tryAt() {
  const url = `https://translate.google.com/translate_a/single?client=at&dt=t&dt=rm&dj=1&sl=en&tl=es&q=${encodeURIComponent(text.slice(0, 4500))}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "AndroidTranslate/5.3.0.RC02.130475354-53000263 5.1 phone TRANSLATE_OPM5_TEST_1",
    },
    signal: AbortSignal.timeout(25000),
  });
  console.log("at status", res.status);
  const data = await res.json();
  console.log("at json slice", JSON.stringify(data).slice(0, 500));
  if (data.sentences) {
    console.log("at joined", data.sentences.map((s) => s.trans).join("").slice(0, 200));
  }
}

await tryDict();
await tryC5();
await tryAt();
