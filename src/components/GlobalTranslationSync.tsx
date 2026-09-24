import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { translationsData } from "@/locales/translationsData";

declare global {
  interface Node {
    __origText?: string;
  }
}

export const GlobalTranslationSync = () => {
  const { i18n } = useTranslation();
  const [, setLangTick] = useState(0);

  useEffect(() => {
    const handleLangChange = () => setLangTick((prev) => prev + 1);
    i18n.on("languageChanged", handleLangChange);
    return () => {
      i18n.off("languageChanged", handleLangChange);
    };
  }, [i18n]);

  useEffect(() => {
    const currentLang = i18n.language || localStorage.getItem("appLanguage") || "en";
    const dict = translationsData[currentLang] || {};
    const isEnglish = currentLang === "en";

    // Map of normalized English string -> translated string
    const translationMap = new Map<string, string>();
    if (!isEnglish) {
      Object.entries(dict).forEach(([key, val]) => {
        if (key && val && key !== val) {
          translationMap.set(key.trim().toLowerCase(), val);
        }
      });
    }

    const translateNode = (node: Text) => {
      const parent = node.parentElement;
      if (!parent) return;
      const tag = parent.tagName.toLowerCase();
      if (
        tag === "script" ||
        tag === "style" ||
        tag === "textarea" ||
        tag === "input" ||
        tag === "code" ||
        tag === "pre" ||
        tag === "svg" ||
        tag === "path"
      ) {
        return;
      }

      if (isEnglish) {
        if (node.__origText !== undefined) {
          node.textContent = node.__origText;
          delete node.__origText;
        }
        return;
      }

      const text = (node.__origText !== undefined ? node.__origText : node.textContent || "").trim();
      if (!text || text.length < 2) return;

      const lower = text.toLowerCase();
      const translated = translationMap.get(lower);

      if (translated) {
        if (node.__origText === undefined) {
          node.__origText = node.textContent || "";
        }
        // Preserve surrounding whitespace if any
        const raw = node.__origText;
        const leadingSpace = raw.match(/^\s*/)?.[0] || "";
        const trailingSpace = raw.match(/\s*$/)?.[0] || "";
        node.textContent = leadingSpace + translated + trailingSpace;
      } else if (node.__origText !== undefined) {
        // If not found in current translation map, restore original text so it doesn't get stuck in previous language
        node.textContent = node.__origText;
      }
    };

    const walk = (root: Node) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let currentNode = walker.nextNode();
      while (currentNode) {
        translateNode(currentNode as Text);
        currentNode = walker.nextNode();
      }
    };

    // Initial walk on root
    const rootEl = document.getElementById("root") || document.body;
    walk(rootEl);

    // MutationObserver to translate dynamically rendered elements, route changes, modals, etc.
    let debounceTimer: number | null = null;
    const observer = new MutationObserver((mutations) => {
      if (debounceTimer) cancelAnimationFrame(debounceTimer);
      debounceTimer = requestAnimationFrame(() => {
        for (const mut of mutations) {
          if (mut.type === "childList") {
            mut.addedNodes.forEach((n) => walk(n));
          } else if (mut.type === "characterData" && mut.target.nodeType === Node.TEXT_NODE) {
            translateNode(mut.target as Text);
          }
        }
      });
    });

    observer.observe(rootEl, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      observer.disconnect();
      if (debounceTimer) cancelAnimationFrame(debounceTimer);
    };
  }, [i18n.language]);

  return null;
};
