// contexts/DataContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import type { ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  DEFAULT_CLASSES,
  DEFAULT_SUBJECTS,
} from "./defaultCurriculumData";
import {
  DEFAULT_COURSE_IMAGES,
  normalizeCourseKey,
  cleanImageUrl,
  getCourseAliases,
} from "../utils/courseImages";
import { canonicalizeSubject } from "@/utils/subjectMatching";
import { courseConfig } from "../utils/courseConstants";

// Interfaces
export interface Subject {
  id: string;
  name: string;
  display_name?: string;
  image?: string;
  description?: string;
}

export interface Topic {
  id: string;
  name: string;
  description?: string;
  subject_id: string;
  class_id: string;
  order_index: number;
}

export interface Class {
  id: string;
  name: string;
  description?: string;
}

export interface Resource {
  id: string;
  title: string;
  url: string;
  duration?: number;
  type: string;
  topic_id?: string;
  order_index: number;
}

export interface SubjectImage {
  [key: string]: string;
}

// Context Types
interface DataContextType {
  // Subjects
  subjects: Subject[];
  subjectsLoading: boolean;
  subjectsError: string | null;
  refreshSubjects: () => Promise<void>;
  getSubjectById: (id: string) => Subject | undefined;
  getSubjectByName: (name: string) => Subject | undefined;

  // Topics
  topics: Topic[];
  topicsLoading: boolean;
  topicsError: string | null;
  refreshTopics: () => Promise<void>;
  getTopicsBySubjectId: (subjectId: string) => Topic[];
  getTopicsBySubjectName: (subjectName: string) => Topic[];

  // Classes
  classes: Class[];
  classesLoading: boolean;
  classesError: string | null;
  refreshClasses: () => Promise<void>;
  getClassByName: (name: string) => Class | undefined;

  // Resources
  resources: Resource[];
  resourcesLoading: boolean;
  resourcesError: string | null;
  refreshResources: () => Promise<void>;
  getResourcesByTopicId: (topicId: string) => Resource[];
  getResourcesByType: (type: string) => Resource[];

  // Subject Images (convenience map)
  subjectImages: SubjectImage;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Custom Hooks
export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

export const useSubjects = () => {
  const {
    subjects,
    subjectsLoading,
    subjectsError,
    refreshSubjects,
    getSubjectById,
    getSubjectByName,
  } = useData();
  return {
    subjects,
    loading: subjectsLoading,
    error: subjectsError,
    refreshSubjects,
    getSubjectById,
    getSubjectByName,
  };
};

export const useTopics = () => {
  const {
    topics,
    topicsLoading,
    topicsError,
    refreshTopics,
    getTopicsBySubjectId,
    getTopicsBySubjectName,
  } = useData();
  return {
    topics,
    loading: topicsLoading,
    error: topicsError,
    refreshTopics,
    getTopicsBySubjectId,
    getTopicsBySubjectName,
  };
};

export const useClasses = () => {
  const {
    classes,
    classesLoading,
    classesError,
    refreshClasses,
    getClassByName,
  } = useData();
  return {
    classes,
    loading: classesLoading,
    error: classesError,
    refreshClasses,
    getClassByName,
  };
};

export const useResources = () => {
  const {
    resources,
    resourcesLoading,
    resourcesError,
    refreshResources,
    getResourcesByTopicId,
    getResourcesByType,
  } = useData();
  return {
    resources,
    loading: resourcesLoading,
    error: resourcesError,
    refreshResources,
    getResourcesByTopicId,
    getResourcesByType,
  };
};

export const useSubjectImages = () => {
  const { subjectImages } = useData();
  return subjectImages;
};

// Provider Component
interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  // States with default curriculum fallback so UI remains functional
  const [subjects, setSubjects] = useState<Subject[]>(DEFAULT_SUBJECTS);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [subjectsError, setSubjectsError] = useState<string | null>(null);

  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [topicsError, setTopicsError] = useState<string | null>(null);

  const [classes, setClasses] = useState<Class[]>(DEFAULT_CLASSES);
  const [classesLoading, setClassesLoading] = useState(true);
  const [classesError, setClassesError] = useState<string | null>(null);

  const [resources, setResources] = useState<Resource[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [resourcesError, setResourcesError] = useState<string | null>(null);

  // Fetch functions with graceful fallback
  const fetchSubjects = async () => {
    try {
      setSubjectsLoading(true);
      setSubjectsError(null);

      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .order("name");

      if (error) {
        console.warn("Using offline subjects fallback:", error.message);
        setSubjects(DEFAULT_SUBJECTS);
        return;
      }

      if (data && data.length > 0) {
        const enriched = data.map((sub: Subject) => {
          let cleanName = (sub.name || "").trim();
          if (cleanName.toLowerCase() === "futher mathematics") {
            cleanName = "further mathematics";
          } else if (cleanName === "agricultural Science") {
            cleanName = "agricultural science";
          }
          const cleanImg = sub.image ? cleanImageUrl(sub.image) : undefined;
          return {
            ...sub,
            name: cleanName,
            display_name:
              sub.display_name ||
              courseConfig[cleanName.toLowerCase()]?.displayName ||
              courseConfig[canonicalizeSubject(cleanName)]?.displayName ||
              cleanName,
            image: cleanImg || sub.image,
          };
        });

        // Ensure all DEFAULT_SUBJECTS exist in the subjects array so no curriculum subject is missing
        const existingCanons = new Set(enriched.map((s) => canonicalizeSubject(s.name)));
        const missingDefaults = DEFAULT_SUBJECTS.filter(
          (ds) => !existingCanons.has(canonicalizeSubject(ds.name))
        );

        setSubjects([...enriched, ...missingDefaults]);
      } else {
        setSubjects(DEFAULT_SUBJECTS);
      }
    } catch {
      console.warn("Notice: Using offline subjects fallback");
      setSubjects(DEFAULT_SUBJECTS);
    } finally {
      setSubjectsLoading(false);
    }
  };

  const fetchTopics = async () => {
    try {
      setTopicsLoading(true);
      setTopicsError(null);

      const { data, error } = await supabase
        .from("topics")
        .select("*")
        .order("order_index");

      if (error) {
        console.warn("Error fetching topics from database:", error.message);
        setTopics([]);
        return;
      }

      setTopics(data || []);
    } catch (err: any) {
      console.warn("Notice: Failed fetching topics from database", err?.message);
      setTopics([]);
    } finally {
      setTopicsLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      setClassesLoading(true);
      setClassesError(null);

      const { data, error } = await supabase
        .from("classes")
        .select("*")
        .order("name");

      if (error) {
        console.warn("Using offline classes fallback:", error.message);
        setClasses(DEFAULT_CLASSES);
        return;
      }

      if (data && data.length > 0) {
        setClasses(data);
      } else {
        setClasses(DEFAULT_CLASSES);
      }
    } catch {
      console.warn("Notice: Using offline classes fallback");
      setClasses(DEFAULT_CLASSES);
    } finally {
      setClassesLoading(false);
    }
  };

  const fetchResources = async () => {
    try {
      setResourcesLoading(true);
      setResourcesError(null);

      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .order("order_index");

      if (error) {
        console.warn("Error fetching resources from database:", error.message);
        setResources([]);
        return;
      }

      setResources(data || []);
    } catch (err: any) {
      console.warn("Notice: Failed fetching resources from database", err?.message);
      setResources([]);
    } finally {
      setResourcesLoading(false);
    }
  };

  // Helper functions
  const getSubjectById = (id: string): Subject | undefined => {
    if (!id) return undefined;
    return (
      subjects.find((subject) => subject.id === id) ||
      DEFAULT_SUBJECTS.find((subject) => subject.id === id)
    );
  };

  const getSubjectByName = (name: string): Subject | undefined => {
    if (!name) return undefined;
    const trimmed = name.trim();
    const lower = trimmed.toLowerCase();
    const canon = canonicalizeSubject(trimmed);

    // 1. Direct case-insensitive match on name or display_name
    const exact = subjects.find(
      (s) =>
        s.name?.toLowerCase() === lower ||
        s.display_name?.toLowerCase() === lower
    );
    if (exact) return exact;

    // 2. Canonical matching (futher mathematics <-> further mathematics, computer science <-> computer studies, etc.)
    const canonMatch = subjects.find((s) => {
      const sCanon = canonicalizeSubject(s.name);
      const sDispCanon = canonicalizeSubject(s.display_name || "");
      return sCanon === canon || (sDispCanon && sDispCanon === canon);
    });
    if (canonMatch) return canonMatch;

    // 3. Fallback search against DEFAULT_SUBJECTS
    const defaultMatch = DEFAULT_SUBJECTS.find((s) => {
      return (
        s.name?.toLowerCase() === lower ||
        s.display_name?.toLowerCase() === lower ||
        canonicalizeSubject(s.name) === canon
      );
    });
    if (defaultMatch) return defaultMatch;

    // 4. Fallback search by ID
    return subjects.find((s) => s.id === trimmed || s.id === lower);
  };

  const getTopicsBySubjectId = (subjectId: string): Topic[] => {
    if (!subjectId) return [];
    const targetSubject = getSubjectById(subjectId) || subjects.find((s) => s.id === subjectId);
    const targetCanon = targetSubject
      ? canonicalizeSubject(targetSubject.name)
      : canonicalizeSubject(subjectId);

    return topics.filter((topic) => {
      if (topic.subject_id === subjectId) return true;
      // Also match if topic's parent subject resolves to same canonical name
      const topicSubject =
        subjects.find((s) => s.id === topic.subject_id) ||
        DEFAULT_SUBJECTS.find((s) => s.id === topic.subject_id);
      if (topicSubject && canonicalizeSubject(topicSubject.name) === targetCanon) {
        return true;
      }
      return false;
    });
  };

  const getTopicsBySubjectName = (subjectName: string): Topic[] => {
    const subject = getSubjectByName(subjectName);
    return subject ? getTopicsBySubjectId(subject.id) : getTopicsBySubjectId(subjectName);
  };

  const getClassByName = (name: string): Class | undefined => {
    if (!name) return classes[0];
    const trimmed = name.trim();
    const clean = trimmed.toLowerCase().replace(/[^a-z0-9]/g, "");

    // 1. Exact match
    const exact = classes.find((cls) => cls.name === trimmed);
    if (exact) return exact;

    // 2. Normalized match (e.g., "SSS1" == "SSS 1")
    const norm = classes.find(
      (cls) => cls.name.toLowerCase().replace(/[^a-z0-9]/g, "") === clean
    );
    if (norm) return norm;

    // 3. Match by ID or fallback to default
    const byId = classes.find(
      (cls) => cls.id === trimmed || cls.id.toLowerCase() === clean
    );
    return (
      byId ||
      DEFAULT_CLASSES.find(
        (cls) => cls.name.toLowerCase().replace(/[^a-z0-9]/g, "") === clean
      ) ||
      classes[0]
    );
  };

  const getResourcesByTopicId = (topicId: string): Resource[] => {
    return resources.filter((resource) => resource.topic_id === topicId);
  };

  const getResourcesByType = (type: string): Resource[] => {
    return resources.filter((resource) => resource.type === type);
  };

  // Subject images map with fallback to all bundled course images
  const subjectImages: SubjectImage = { ...DEFAULT_COURSE_IMAGES };
  subjects.forEach((subject) => {
    if (subject.image) {
      const cleanImg = cleanImageUrl(subject.image);
      if (cleanImg) {
        subjectImages[subject.name] = cleanImg;
        subjectImages[subject.name.toLowerCase().trim()] = cleanImg;
        const normKey = normalizeCourseKey(subject.name);
        subjectImages[normKey] = cleanImg;
        if (subject.id) {
          subjectImages[subject.id] = cleanImg;
        }

        // Map all known aliases (e.g. futher -> further mathematics, computer science -> computer studies)
        const aliases = getCourseAliases(subject.name);
        aliases.forEach((alias) => {
          subjectImages[alias] = cleanImg;
        });
      }
    }
  });

  // Refresh functions
  const refreshSubjects = async () => {
    await fetchSubjects();
  };

  const refreshTopics = async () => {
    await fetchTopics();
  };

  const refreshClasses = async () => {
    await fetchClasses();
  };

  const refreshResources = async () => {
    await fetchResources();
  };

  // Initial fetch
  useEffect(() => {
    const fetchAllData = async () => {
      await Promise.all([
        fetchSubjects(),
        fetchTopics(),
        fetchClasses(),
        fetchResources(),
      ]);
    };

    fetchAllData();
  }, []);

  const value = {
    // Subjects
    subjects,
    subjectsLoading,
    subjectsError,
    refreshSubjects,
    getSubjectById,
    getSubjectByName,

    // Topics
    topics,
    topicsLoading,
    topicsError,
    refreshTopics,
    getTopicsBySubjectId,
    getTopicsBySubjectName,

    // Classes
    classes,
    classesLoading,
    classesError,
    refreshClasses,
    getClassByName,

    // Resources
    resources,
    resourcesLoading,
    resourcesError,
    refreshResources,
    getResourcesByTopicId,
    getResourcesByType,

    // Subject Images
    subjectImages,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export function useStudentData() {
    const context = useContext(DataContext)
    if(!context) {
        throw new Error("useStudentData must be used within a DataContextProvider");
    }
    return context
}
