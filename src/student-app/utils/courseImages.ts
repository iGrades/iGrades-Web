import accBg from "@/assets/courses/acc_bg.png";
import agricBg from "@/assets/courses/agric_bg.png";
import basicSciBg from "@/assets/courses/basicSci_bg.png";
import basicTechBg from "@/assets/courses/basicTech_bg.png";
import bioBg from "@/assets/courses/bio_bg.png";
import businessBg from "@/assets/courses/business_bg.png";
import businessStuBg from "@/assets/courses/business_stu.png";
import chemBg from "@/assets/courses/chem_bg.png";
import civicEduBg from "@/assets/courses/civic_edu.png";
import commerceBg from "@/assets/courses/commerce.png";
import compBg from "@/assets/courses/comp_bg.png";
import creativeArtsBg from "@/assets/courses/creative_arts.png";
import econsBg from "@/assets/courses/econs_bg.png";
import engBg from "@/assets/courses/eng_bg.png";
import fineArtsBg from "@/assets/courses/fine_arts.png";
import frenchBg from "@/assets/courses/french.png";
import furtherMathsBg from "@/assets/courses/further_maths.png";
import genMathsBg from "@/assets/courses/genMaths_bg.png";
import geoBg from "@/assets/courses/geo_bg.png";
import govtBg from "@/assets/courses/govt_bg.png";
import historyBg from "@/assets/courses/history.png";
import homeEconsBg from "@/assets/courses/home_econs.png";
import literatureBg from "@/assets/courses/literature.png";
import musicBg from "@/assets/courses/music.png";
import phyBg from "@/assets/courses/phy_bg.png";
import physicalEduBg from "@/assets/courses/physical_edu.png";
import socialStuBg from "@/assets/courses/social_stu.png";

/**
 * Sanitizes any image URL by stripping newlines, carriage returns, and extra spaces.
 * This fixes cases where database records contain trailing '\r\n'.
 */
export function cleanImageUrl(url?: string | null): string {
  if (!url) return "";
  return url
    .trim()
    .replace(/[\r\n\t]+/g, "")
    .replace(/%0D%0A/gi, "")
    .replace(/%0A/gi, "")
    .replace(/%0D/gi, "");
}

/**
 * Static course image mapping covering all senior and junior courses.
 */
export const DEFAULT_COURSE_IMAGES: Record<string, string> = {
  // Mathematics
  mathematics: genMathsBg,
  "general mathematics": genMathsBg,
  maths: genMathsBg,
  math: genMathsBg,
  "further mathematics": furtherMathsBg,
  "futher mathematics": furtherMathsBg,
  "further maths": furtherMathsBg,

  // English
  english: engBg,
  "english language": engBg,

  // Sciences
  physics: phyBg,
  chemistry: chemBg,
  biology: bioBg,
  "basic science": basicSciBg,
  "basic science and technology": basicSciBg,
  "basic science & technology": basicSciBg,
  "basic technology": basicTechBg,
  "basic tech": basicTechBg,

  // Commercial / Social Sciences
  accounting: accBg,
  "financial accounting": accBg,
  economics: econsBg,
  commerce: commerceBg,
  "business studies": businessBg || businessStuBg,
  "business study": businessBg || businessStuBg,
  business: businessBg || businessStuBg,
  government: govtBg,
  geography: geoBg,
  "social studies": socialStuBg,
  "social study": socialStuBg,
  "civic education": civicEduBg,
  civic: civicEduBg,
  "agricultural science": agricBg,
  "agricultural Science": agricBg,
  "agric science": agricBg,
  agriculture: agricBg,
  agric: agricBg,

  // Arts & Humanities
  literature: literatureBg,
  "literature in english": literatureBg,
  history: historyBg,
  "fine arts": fineArtsBg,
  "visual arts": fineArtsBg,
  "creative arts": creativeArtsBg,
  music: musicBg,
  french: frenchBg,
  "french language": frenchBg,

  // Technology & Vocational
  "computer studies": compBg,
  "computer science": compBg,
  computer: compBg,
  ict: compBg,
  "home economics": homeEconsBg,
  "home econs": homeEconsBg,
  "physical education": physicalEduBg,
  "physical and health education": physicalEduBg,
  "physical & health education": physicalEduBg,
  phe: physicalEduBg,
};

/**
 * Normalizes course strings into a comparable key (e.g. "General Mathematics" -> "general mathematics").
 */
export function normalizeCourseKey(nameOrId: string): string {
  if (!nameOrId) return "";
  return nameOrId
    .toLowerCase()
    .trim()
    .replace(/[\r\n\t]+/g, "")
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ");
}

/**
 * Maps known alias variants so database entries like "futher mathematics" match "further mathematics".
 */
export function getCourseAliases(key: string): string[] {
  const norm = normalizeCourseKey(key);
  const aliases: string[] = [norm];

  if (norm === "futher mathematics" || norm === "further mathematics" || norm === "further maths") {
    aliases.push("further mathematics", "futher mathematics", "further maths");
  }
  if (norm === "computer science" || norm === "computer studies" || norm === "computer" || norm === "ict") {
    aliases.push("computer science", "computer studies", "computer", "ict");
  }
  if (norm.includes("agric")) {
    aliases.push("agricultural science", "agric science", "agriculture", "agric");
  }
  if (norm === "literature" || norm === "literature in english") {
    aliases.push("literature", "literature in english");
  }
  if (norm === "mathematics" || norm === "general mathematics" || norm === "maths" || norm === "math") {
    aliases.push("mathematics", "general mathematics", "maths", "math");
  }
  if (norm.includes("basic science")) {
    aliases.push("basic science", "basic science and technology", "basic science & technology");
  }
  if (norm.includes("basic tech")) {
    aliases.push("basic technology", "basic tech");
  }
  if (norm.includes("physical") || norm === "phe") {
    aliases.push("physical education", "physical and health education", "physical & health education", "phe");
  }
  if (norm.includes("business")) {
    aliases.push("business studies", "business study", "business");
  }
  if (norm.includes("civic")) {
    aliases.push("civic education", "civic");
  }
  if (norm.includes("social")) {
    aliases.push("social studies", "social study");
  }

  return Array.from(new Set(aliases));
}

/**
 * Returns a guaranteed valid image URL for any course name or ID.
 * Prioritizes database URL if valid (sanitized), then bundled asset, with multiple alias attempts.
 */
export function getCourseThumbnail(
  courseNameOrId?: string | null,
  dbImages?: Record<string, string | null | undefined>
): string {
  if (!courseNameOrId) return genMathsBg;

  const rawKey = courseNameOrId.trim();
  const normalizedKey = normalizeCourseKey(courseNameOrId);
  const compactKey = normalizedKey.replace(/\s+/g, "");
  const aliases = getCourseAliases(courseNameOrId);

  // 1. Check database images if provided
  if (dbImages) {
    if (dbImages[rawKey]) {
      const cleaned = cleanImageUrl(dbImages[rawKey]);
      if (cleaned) return cleaned;
    }
    if (dbImages[normalizedKey]) {
      const cleaned = cleanImageUrl(dbImages[normalizedKey]);
      if (cleaned) return cleaned;
    }
    if (dbImages[compactKey]) {
      const cleaned = cleanImageUrl(dbImages[compactKey]);
      if (cleaned) return cleaned;
    }

    // Check alias list against dbImages
    for (const alias of aliases) {
      if (dbImages[alias]) {
        const cleaned = cleanImageUrl(dbImages[alias]);
        if (cleaned) return cleaned;
      }
    }

    // Check case-insensitive entries
    for (const [key, url] of Object.entries(dbImages)) {
      if (url && (normalizeCourseKey(key) === normalizedKey || aliases.includes(normalizeCourseKey(key)))) {
        const cleaned = cleanImageUrl(url);
        if (cleaned) return cleaned;
      }
    }
  }

  // 2. Check bundled image dictionary with aliases
  for (const alias of aliases) {
    if (DEFAULT_COURSE_IMAGES[alias]) {
      return DEFAULT_COURSE_IMAGES[alias];
    }
  }

  if (DEFAULT_COURSE_IMAGES[compactKey]) {
    return DEFAULT_COURSE_IMAGES[compactKey];
  }

  // 3. Substring match fallback (e.g., "mathematics 1" -> mathematics)
  for (const [key, img] of Object.entries(DEFAULT_COURSE_IMAGES)) {
    if (normalizedKey.includes(key) || key.includes(normalizedKey)) {
      return img;
    }
  }

  // Default fallback
  return genMathsBg;
}
