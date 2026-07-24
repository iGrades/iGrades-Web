// contexts/DataContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import type { ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";

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
  // States
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [subjectsError, setSubjectsError] = useState<string | null>(null);

  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [topicsError, setTopicsError] = useState<string | null>(null);

  const [classes, setClasses] = useState<Class[]>([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [classesError, setClassesError] = useState<string | null>(null);

  const [resources, setResources] = useState<Resource[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [resourcesError, setResourcesError] = useState<string | null>(null);

  // Fetch functions
  const fetchSubjects = async () => {
    try {
      setSubjectsLoading(true);
      setSubjectsError(null);

      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .order("name");

      if (error) throw new Error(`Error fetching subjects: ${error.message}`);

      setSubjects(data || []);
    } catch (err) {
      setSubjectsError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      console.error("Error fetching subjects:", err);
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

      if (error) throw new Error(`Error fetching topics: ${error.message}`);

      setTopics(data || []);
    } catch (err) {
      setTopicsError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      console.error("Error fetching topics:", err);
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

      if (error) throw new Error(`Error fetching classes: ${error.message}`);

      setClasses(data || []);
    } catch (err) {
      setClassesError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      console.error("Error fetching classes:", err);
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

      if (error) throw new Error(`Error fetching resources: ${error.message}`);

      setResources(data || []);
    } catch (err) {
      setResourcesError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      console.error("Error fetching resources:", err);
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
