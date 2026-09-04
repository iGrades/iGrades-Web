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
  DEFAULT_TOPICS,
  DEFAULT_RESOURCES,
} from "./defaultCurriculumData";

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

  const [topics, setTopics] = useState<Topic[]>(DEFAULT_TOPICS);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [topicsError, setTopicsError] = useState<string | null>(null);

  const [classes, setClasses] = useState<Class[]>(DEFAULT_CLASSES);
  const [classesLoading, setClassesLoading] = useState(true);
  const [classesError, setClassesError] = useState<string | null>(null);

  const [resources, setResources] = useState<Resource[]>(DEFAULT_RESOURCES);
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
        setSubjects(data);
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
        console.warn("Using offline topics fallback:", error.message);
        setTopics(DEFAULT_TOPICS);
        return;
      }

      if (data && data.length > 0) {
        setTopics(data);
      } else {
        setTopics(DEFAULT_TOPICS);
      }
    } catch {
      console.warn("Notice: Using offline topics fallback");
      setTopics(DEFAULT_TOPICS);
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
        console.warn("Using offline resources fallback:", error.message);
        setResources(DEFAULT_RESOURCES);
        return;
      }

      if (data && data.length > 0) {
        setResources(data);
      } else {
        setResources(DEFAULT_RESOURCES);
      }
    } catch {
      console.warn("Notice: Using offline resources fallback");
      setResources(DEFAULT_RESOURCES);
    } finally {
      setResourcesLoading(false);
    }
  };

  // Helper functions
  const getSubjectById = (id: string): Subject | undefined => {
    return subjects.find((subject) => subject.id === id);
  };

  const getSubjectByName = (name: string): Subject | undefined => {
    return subjects.find((subject) => subject.name === name);
  };

  const getTopicsBySubjectId = (subjectId: string): Topic[] => {
    return topics.filter((topic) => topic.subject_id === subjectId);
  };

  const getTopicsBySubjectName = (subjectName: string): Topic[] => {
    const subject = getSubjectByName(subjectName);
    return subject ? getTopicsBySubjectId(subject.id) : [];
  };

  const getClassByName = (name: string): Class | undefined => {
    return classes.find((cls) => cls.name === name);
  };

  const getResourcesByTopicId = (topicId: string): Resource[] => {
    return resources.filter((resource) => resource.topic_id === topicId);
  };

  const getResourcesByType = (type: string): Resource[] => {
    return resources.filter((resource) => resource.type === type);
  };

  // Subject images map (convenience)
  const subjectImages: SubjectImage = {};
  subjects.forEach((subject) => {
    if (subject.image) {
      subjectImages[subject.name] = subject.image;
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
