import express from "express";

// Map frontend language codes to Google Translate codes
const LANG_MAP: Record<string, string> = {
  en: "en",
  ha: "ha", // Hausa
  yo: "yo", // Yoruba
  ig: "ig", // Igbo
  ak: "tw", // Akan / Twi
  ff: "ff", // Fulfulde / Fula
  wo: "wo", // Wolof
  fr: "fr", // French
  pt: "pt", // Portuguese
};

// In-memory cache for server translations
const translationCache = new Map<string, string>();

/**
 * Translates a single text string using Google Translate single endpoint
 */
async function translateSingle(text: string, targetLang: string, sourceLang = "auto"): Promise<string> {
  const cacheKey = `${targetLang}:${text}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  const mappedTarget = LANG_MAP[targetLang] || targetLang;
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(sourceLang)}&tl=${encodeURIComponent(mappedTarget)}&dt=t&q=${encodeURIComponent(text)}`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return text;
    const data = await res.json();
    if (data && Array.isArray(data[0])) {
      const translated = data[0].map((item: any) => item[0]).join("") || text;
      translationCache.set(cacheKey, translated);
      return translated;
    }
  } catch {
    // If request fails or times out, return original text
  }
  return text;
}

/**
 * Translates a batch of text strings efficiently
 */
async function translateBatch(texts: string[], targetLang: string, sourceLang = "auto"): Promise<Record<string, string>> {
  const results: Record<string, string> = {};
  const uncached: string[] = [];

  for (const text of texts) {
    if (!text || text.trim() === "") continue;
    const cacheKey = `${targetLang}:${text}`;
    if (translationCache.has(cacheKey)) {
      results[text] = translationCache.get(cacheKey)!;
    } else {
      uncached.push(text);
    }
  }

  if (uncached.length === 0) {
    return results;
  }

  const mappedTarget = LANG_MAP[targetLang] || targetLang;

  // Process in chunks of up to 20 texts using delimiter
  const CHUNK_SIZE = 20;
  for (let i = 0; i < uncached.length; i += CHUNK_SIZE) {
    const chunk = uncached.slice(i, i + CHUNK_SIZE);
    const combined = chunk.join("\n===\n");
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(sourceLang)}&tl=${encodeURIComponent(mappedTarget)}&dt=t&q=${encodeURIComponent(combined)}`;

    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data[0])) {
          const fullTranslation = data[0].map((item: any) => item[0]).join("");
          const parts = fullTranslation.split(/\s*===\s*/);
          if (parts.length === chunk.length) {
            for (let j = 0; j < chunk.length; j++) {
              const orig = chunk[j];
              const trans = parts[j]?.trim() || orig;
              results[orig] = trans;
              translationCache.set(`${targetLang}:${orig}`, trans);
            }
            continue;
          }
        }
      }
    } catch {
      // Chunk delimiter failed or timed out, fallback to individual translation
    }

    // Individual fallback for this chunk
    await Promise.all(
      chunk.map(async (orig) => {
        const trans = await translateSingle(orig, targetLang, sourceLang);
        results[orig] = trans;
      })
    );
  }

  return results;
}

export function registerTranslationRoutes(app: express.Express) {
  app.post("/api/translate", async (req: express.Request, res: express.Response) => {
    try {
      const { texts, targetLang, sourceLang = "auto" } = req.body || {};

      if (!targetLang || typeof targetLang !== "string") {
        return res.status(400).json({ error: "targetLang is required" });
      }

      if (!texts || !Array.isArray(texts)) {
        return res.status(400).json({ error: "texts must be an array of strings" });
      }

      // Limit max texts per request to 100 for safety and speed
      const safeTexts = texts.slice(0, 100).filter((t: any) => typeof t === "string" && t.trim().length > 0);

      if (safeTexts.length === 0) {
        return res.json({ success: true, translations: {} });
      }

      if (targetLang === "en") {
        const identity: Record<string, string> = {};
        for (const t of safeTexts) {
          identity[t] = t;
        }
        return res.json({ success: true, translations: identity });
      }

      const translations = await translateBatch(safeTexts, targetLang, sourceLang);
      return res.json({ success: true, translations });
    } catch (err: any) {
      console.error("Error in /api/translate:", err);
      return res.status(500).json({ error: err?.message || "Translation failed" });
    }
  });
}
