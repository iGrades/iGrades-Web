// src/utils/subjectMatching.ts
// Utility for parsing student registered courses and matching against subject records

import { courseConfig } from "@/student-app/utils/courseConstants";

/**
 * Parses registered courses from various data shapes (array, JSON string, comma-separated)
 * into a clean list of lowercase strings.
 */
export function parseRegisteredCourses(raw: unknown): string[] {
  if (!raw) return [];

  let items: string[] = [];

  if (Array.isArray(raw)) {
    items = raw.map((item) => String(item).trim());
  } else if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          items = parsed.map((item) => String(item).trim());
        }
      } catch {
        items = trimmed
          .slice(1, -1)
          .split(",")
          .map((item) => item.replace(/['"]/g, "").trim());
      }
    } else {
      items = trimmed.split(",").map((item) => item.trim());
    }
  }

  return items.map((c) => c.toLowerCase()).filter(Boolean);
}

/**
 * Normalizes a subject name or identifier into a canonical form for matching.
 * Handles known curriculum aliases, punctuation variations, and spelling quirks.
 */
export function canonicalizeSubject(str: string): string {
  if (!str) return "";
  const clean = str.toLowerCase().replace(/[^a-z0-9]/g, "");

  // Known curriculum equivalencies & DB spelling quirks
  if (clean === "furthermathematics" || clean === "futhermathematics" || clean === "furthermaths") {
    return "furthermathematics";
  }
  if (
    clean === "computerscience" ||
    clean === "computerstudies" ||
    clean === "computing" ||
    clean === "ict" ||
    clean === "informationtechnology"
  ) {
    return "computerstudies";
  }
  if (
    clean === "agriculturalscience" ||
    clean === "agriculture" ||
    clean === "agric" ||
    clean === "agricscience"
  ) {
    return "agriculturalscience";
  }
  if (clean === "englishlanguage" || clean === "english") {
    return "english";
  }
  if (clean === "literatureinenglish" || clean === "literature") {
    return "literature";
  }
  if (
    clean === "physicaleducation" ||
    clean === "physicalandhealtheducation" ||
    clean === "phe" ||
    clean === "pe"
  ) {
    return "physicaleducation";
  }
  if (clean === "basicscience" || clean === "integratedscience") {
    return "basicscience";
  }
  if (
    clean === "basictechnology" ||
    clean === "introductorytechnology" ||
    clean === "introtech"
  ) {
    return "basictechnology";
  }
  if (clean === "socialstudies" || clean === "socialscience") {
    return "socialstudies";
  }
  if (clean === "civiceducation" || clean === "civics") {
    return "civiceducation";
  }
  if (clean === "homeeconomics" || clean === "homeec") {
    return "homeeconomics";
  }
  if (clean === "creativearts" || clean === "finearts" || clean === "visualarts") {
    return "creativearts";
  }

  return clean;
}

/**
 * Returns true if the subject matches any of the registered courses.
 */
export function isSubjectRegistered(
  subject: { subjectId?: string; id?: string; subjectName?: string; name?: string },
  registeredCourses: unknown
): boolean {
  const registeredList = parseRegisteredCourses(registeredCourses);
  if (registeredList.length === 0) return false;

  const rawSubId = (subject.subjectId || subject.id || "").trim().toLowerCase();
  const rawSubName = (subject.subjectName || subject.name || "").trim().toLowerCase();

  const canonicalSubName = canonicalizeSubject(rawSubName);
  const canonicalSubId = canonicalizeSubject(rawSubId);

  return registeredList.some((course) => {
    const rawCourse = course.trim().toLowerCase();
    const canonicalCourse = canonicalizeSubject(rawCourse);

    // Direct string match
    if (rawCourse === rawSubId || rawCourse === rawSubName) return true;

    // Canonical alphanumeric match
    if (canonicalCourse && (canonicalCourse === canonicalSubId || canonicalCourse === canonicalSubName)) {
      return true;
    }

    // Substring or prefix match for IDs (e.g., "sub-math" matching "mathematics")
    if (rawSubId.startsWith("sub-")) {
      const slug = rawSubId.replace("sub-", "");
      if (rawCourse.startsWith(slug) || slug.startsWith(rawCourse.slice(0, 3))) {
        return true;
      }
    }

    return false;
  });
}

/**
 * Filters an array of subject items to only include subjects the student has registered for.
 */
export function filterRegisteredSubjects<
  T extends { subjectId?: string; id?: string; subjectName?: string; name?: string }
>(subjects: T[], registeredCourses: unknown): T[] {
  const registeredList = parseRegisteredCourses(registeredCourses);
  if (registeredList.length === 0) {
    return [];
  }

  return subjects.filter((subject) => isSubjectRegistered(subject, registeredList));
}

/**
 * Resolves a clean display name for a subject.
 */
export function getSubjectDisplayName(subjectNameOrId: string): string {
  if (!subjectNameOrId) return "";
  const key = subjectNameOrId.trim().toLowerCase();
  if (courseConfig[key]?.displayName) {
    return courseConfig[key].displayName;
  }
  // Title case fallback
  return subjectNameOrId
    .split(/[\s-_]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
