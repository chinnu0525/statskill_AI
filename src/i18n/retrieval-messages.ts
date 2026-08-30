import type { Locale } from "./messages";

export const retrievalMessages: Record<Locale, Record<string, string>> = {
  en: {
    sourceSearch: "Source search",
    sourceSearchHint: "Search only the learning materials you uploaded. Results stay grounded in your private source chunks.",
    sourceQueryPlaceholder: "Search your learning materials",
    searchSources: "Search sources",
    searchingSources: "Searching…",
    noSourceResults: "No matching source passages found.",
    sourceSearchFailed: "Source search could not be completed.",
    sourceChunk: "Source passage"
  },
  hi: {
    sourceSearch: "स्रोत खोज",
    sourceSearchHint: "केवल आपके अपलोड किए गए शिक्षण सामग्री में खोजें। परिणाम आपके निजी स्रोत अंशों पर आधारित रहते हैं।",
    sourceQueryPlaceholder: "अपनी शिक्षण सामग्री खोजें",
    searchSources: "स्रोत खोजें",
    searchingSources: "खोज जारी है…",
    noSourceResults: "कोई मेल खाता स्रोत अंश नहीं मिला।",
    sourceSearchFailed: "स्रोत खोज पूरी नहीं हो सकी।",
    sourceChunk: "स्रोत अंश"
  },
  te: {
    sourceSearch: "మూలాధార శోధన",
    sourceSearchHint: "మీరు అప్‌లోడ్ చేసిన అభ్యాస సామగ్రిలో మాత్రమే శోధించండి. ఫలితాలు మీ ప్రైవేట్ మూలాధార భాగాలపై ఆధారపడుతాయి.",
    sourceQueryPlaceholder: "మీ అభ్యాస సామగ్రిని శోధించండి",
    searchSources: "మూలాలను శోధించండి",
    searchingSources: "శోధిస్తోంది…",
    noSourceResults: "సరిపోలే మూలాధార భాగాలు కనబడలేదు.",
    sourceSearchFailed: "మూలాధార శోధన పూర్తి కాలేదు.",
    sourceChunk: "మూలాధార భాగం"
  }
};
