"use client";

import {
  Portal,
  Select,
  createListCollection,
  Box,
  Flex,
  Heading,
  Textarea,
  Input,
  VStack,
  HStack,
  Button,
  Icon,
  Text,
  Alert,
  Badge,
  IconButton,
  Tabs,
  Grid,
  GridItem,
  Code,
} from "@chakra-ui/react";
import { useState, useEffect, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import {
  FiFile, FiX, FiPlus, FiTrash2, FiDownload, FiUpload, FiImage,
  FiAlertCircle, FiCheckCircle, FiExternalLink, FiCheck
} from "react-icons/fi";
import { IoCloudUploadOutline } from "react-icons/io5";
import { MdQuiz, MdPlaylistAdd, MdVideoLibrary, MdPictureAsPdf } from "react-icons/md";
import { HiOutlineDocumentArrowUp } from "react-icons/hi2";
import * as XLSX from "xlsx";
import { supabase } from "@/lib/supabaseClient";

interface Class { id: string; name: string }
interface Subject { id: string; name: string }
interface Topic { id: string; name: string; description: string; class_id: string; subject_id: string; order_index: number }
interface SubTopic {
  id: string;
  name: string;
  description?: string;
  desc?: string;
  order_index?: number;
  topic_id: string;
  class_id: string;
  subject_id: string;
  created_at?: string;
}
interface NewSubTopicEntry {
  id: string;
  name: string;
  desc: string;
}
export interface BulkParsedSubtopic {
  name: string;
  description: string;
}
export interface BulkParsedTopic {
  topicName: string;
  topicDescription: string;
  subtopics: BulkParsedSubtopic[];
}

const SAMPLE_TOPIC_OUTLINE = `Topic: Algebraic Processes
Description: Operations on algebraic expressions and equations
- Simultaneous Linear Equations: Elimination and substitution methods
- Quadratic Equations: Factoring, completing the square, and quadratic formula
- Linear Inequalities in One Variable: Graphical representation and number lines

Topic: Plane Geometry & Trigonometry
Description: Properties of geometric figures, angles, and trigonometric ratios
- Trigonometric Ratios (Sine, Cosine, Tangent): Definitions for right-angled triangles
- Angles of Elevation and Depression: Real-world problems and height calculations
- Circle Theorems: Angles subtended by arcs and cyclic quadrilaterals

Topic: Statistics & Data Presentation
Description: Measures of central tendency and frequency distributions
- Mean, Median and Mode of Grouped Data: Calculating averages from tables
- Cumulative Frequency Curves (Ogive): Median, quartiles, and percentiles
- Measures of Dispersion: Variance and standard deviation`;

export interface BulkParsedResource {
  id: string;
  title: string;
  type: "pdf" | "video" | "pqs";
  fileName: string;
  url?: string;
  topicName: string;
  subTopicName?: string;
  description?: string;
  matchedTopicId?: string;
  matchedSubTopicId?: string;
  isNewTopic?: boolean;
  status: "ready" | "fallback" | "missing_topic" | "invalid_url";
}

export interface BatchResourceFileItem {
  id: string;
  file: File;
  name: string;
  title: string;
  type: "pdf" | "video" | "pqs";
  topicId: string;
  subTopicId?: string;
  description?: string;
  status: "queued" | "uploading" | "done" | "error";
  errorMsg?: string;
}

const SAMPLE_RESOURCE_PASTE = `Title | Type | File Name | Topic | Subtopic | Description
Simultaneous Linear Equations Video Tutorial | video | simultaneous_linear_equations.mp4 | Algebraic Processes | Simultaneous Linear Equations | Comprehensive video walkthrough with worked examples
Quadratic Equations Revision Notes | pdf | quadratic_equations_notes.pdf | Algebraic Processes | Quadratic Equations | Formulas, derivations, and practice problems
Circle Theorems Masterclass | video | circle_theorems_proofs.mp4 | Plane Geometry & Trigonometry | Circle Theorems | Visual geometry proofs and exam techniques
Geometry Formula Compendium | pdf | trig_geometry_handout.pdf | Plane Geometry & Trigonometry | Trigonometric Ratios | Quick reference guide for revision`;

interface Quiz {
  id: string;
  subject_id: string;
  topic_id: string;
  class_id: string;
  quiz_type?: string;
  title?: string;
}
interface QuizQuestion {
  question_text: string;
  option_a: string; option_b: string; option_c: string; option_d: string;
  correct_option: "a" | "b" | "c" | "d" | "";
  answer_explanation?: string;
  subtopic_id?: string | null;
  subtopic_name?: string;
  image_file?: File | null;
  image_preview?: string | null;
  csv_image_name?: string;
}

const emptyQuestion = (): QuizQuestion => ({
  question_text: "", option_a: "", option_b: "", option_c: "", option_d: "",
  correct_option: "", answer_explanation: "", subtopic_id: null, subtopic_name: "",
  image_file: null, image_preview: null, csv_image_name: "",
});

/* ── Reusable styled select ── */
interface SelectItem { label: string; value: string }
const StyledSelect = ({
  collection, value, onValueChange, label, placeholder, disabled = false, size, multiple = false,
}: {
  collection: ReturnType<typeof createListCollection<SelectItem>>;
  value: string[]; onValueChange: (e: any) => void;
  label: string; placeholder: string; disabled?: boolean; size?: 'xs' | 'sm' | 'md' | 'lg';
  multiple?: boolean;
}) => (
  <Box>
    <Select.Root
      collection={collection} width="100%" variant="subtle"
      value={value} onValueChange={onValueChange} disabled={disabled}
      multiple={multiple}
      {...(size ? { size } : {})}
    >
      <Select.HiddenSelect />
      <Select.Label
        fontSize="xs" fontWeight="600" color="gray.500"
        textTransform="uppercase" letterSpacing="0.05em" mb={1}
      >
        {label}
      </Select.Label>
      <Select.Control>
        <Select.Trigger
          bg="gray.50" borderRadius="lg" border="1px solid" borderColor="gray.200"
          _hover={{ borderColor: "blue.300" }} transition="border-color 0.15s"
        >
          <Select.ValueText placeholder={placeholder} />
        </Select.Trigger>
        <Select.IndicatorGroup><Select.Indicator /></Select.IndicatorGroup>
      </Select.Control>
      <Portal>
        <Select.Positioner>
          <Select.Content>
            {collection.items.map((item: any) => (
              <Select.Item item={item} key={item.value}>
                {item.label}<Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Portal>
    </Select.Root>
  </Box>
);

/* ── Section card ── */
const SectionCard = ({ children, accentColor = "blue.500", icon, title, subtitle }: {
  children: React.ReactNode; accentColor?: string;
  icon: React.ElementType; title: string; subtitle: string;
}) => {
  const [colorBase] = accentColor.split(".");
  return (
    <Box
      bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.200"
      overflow="hidden" boxShadow="0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)"
      h="fit-content"
    >
      <Box px={6} pt={5} pb={4} borderBottom="1px solid" borderColor="gray.100">
        <HStack gap={3}>
          <Box bg={`${colorBase}.50`} p={2} borderRadius="lg">
            <Icon as={icon} boxSize={5} color={accentColor} />
          </Box>
          <Box>
            <Text fontWeight="700" fontSize="md" color="gray.800" lineHeight="1.2">{title}</Text>
            <Text fontSize="xs" color="gray.500" mt={0.5}>{subtitle}</Text>
          </Box>
        </HStack>
      </Box>
      <Box px={6} py={5}>{children}</Box>
    </Box>
  );
};

const fieldLabelProps = {
  fontSize: "xs" as const,
  fontWeight: "600" as const,
  color: "gray.500",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  mb: 1,
};

const CMS = () => {
  const [fileType, setFileType] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Global Context Lists
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  // Standalone Topic Management states
  const [topicCreationTab, setTopicCreationTab] = useState<"new_topic" | "existing_topic" | "bulk_import">("new_topic");
  const [newTopicName, setNewTopicName] = useState("");
  const [newTopicDescription, setNewTopicDescription] = useState("");
  const [topicClass, setTopicClass] = useState<string[]>([]);
  const [topicSubject, setTopicSubject] = useState<string[]>([]);
  const [topicModeTopics, setTopicModeTopics] = useState<Topic[]>([]);
  const [subTopicsList, setSubTopicsList] = useState<NewSubTopicEntry[]>([
    { id: "1", name: "", desc: "" },
  ]);
  const [topicLoading, setTopicLoading] = useState(false);

  // Add subtopics to existing topic state
  const [existingTopicId, setExistingTopicId] = useState<string[]>([]);
  const [existingTopicSubList, setExistingTopicSubList] = useState<NewSubTopicEntry[]>([
    { id: "1", name: "", desc: "" },
  ]);
  const [existingTopicCurrentSubTopics, setExistingTopicCurrentSubTopics] = useState<SubTopic[]>([]);
  const [existingSubLoading, setExistingSubLoading] = useState(false);

  // Bulk Topic & Subtopic Import states
  const [bulkTopicMode, setBulkTopicMode] = useState<"file" | "paste">("file");
  const [bulkImportFileName, setBulkImportFileName] = useState<string | null>(null);
  const [bulkImportText, setBulkImportText] = useState("");
  const [bulkParsedTopics, setBulkParsedTopics] = useState<BulkParsedTopic[]>([]);
  const [bulkImportError, setBulkImportError] = useState<string | null>(null);
  const [bulkImportLoading, setBulkImportLoading] = useState(false);

  // Left Column (Resources) States
  const [resourceActiveTab, setResourceActiveTab] = useState<"single" | "batch_files" | "spreadsheet">("single");
  const [selectedClass, setSelectedClass] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string[]>([]);
  const [resourceSubTopics, setResourceSubTopics] = useState<SubTopic[]>([]);
  const [selectedSubTopicId, setSelectedSubTopicId] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Batch Files Upload states
  const [batchResourceFiles, setBatchResourceFiles] = useState<BatchResourceFileItem[]>([]);
  const [batchUploading, setBatchUploading] = useState(false);

  // Spreadsheet / Links Bulk Import states
  const [bulkResourceMode, setBulkResourceMode] = useState<"file" | "paste">("file");
  const [bulkResourceFileName, setBulkResourceFileName] = useState<string | null>(null);
  const [bulkResourceText, setBulkResourceText] = useState("");
  const [bulkParsedResources, setBulkParsedResources] = useState<BulkParsedResource[]>([]);
  const [bulkResourceAttachedFiles, setBulkResourceAttachedFiles] = useState<File[]>([]);
  const [bulkResourceImportError, setBulkResourceImportError] = useState<string | null>(null);
  const [bulkResourceImportLoading, setBulkResourceImportLoading] = useState(false);

  // Right Column (Quiz) States
  const [quizSelectedClass, setQuizSelectedClass] = useState<string[]>([]);
  const [quizSelectedSubject, setQuizSelectedSubject] = useState<string[]>([]);
  const [quizTopics, setQuizTopics] = useState<Topic[]>([]);
  const [quizSelectedTopic, setQuizSelectedTopic] = useState<string[]>([]);
  const [quizSubTopics, setQuizSubTopics] = useState<SubTopic[]>([]);
  const [quizSelectedSubtopics, setQuizSelectedSubtopics] = useState<string[]>([]);
  const [quizActiveTab, setQuizActiveTab] = useState<"manual" | "import">("manual");
  
  const [questions, setQuestions] = useState<QuizQuestion[]>([emptyQuestion()]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizQuestionCount, setQuizQuestionCount] = useState<number>(0);

  const [importedQuestions, setImportedQuestions] = useState<QuizQuestion[]>([]);
  const [importFileName, setImportFileName] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [bulkImageFiles, setBulkImageFiles] = useState<File[]>([]);

  // ── Lifecycles & Data Syncing ──
  useEffect(() => { fetchInitialData(); }, []);

  // Sync topic mode topics list dynamically for the Create Topic / Subtopic section
  useEffect(() => {
    setExistingTopicId([]);
    setExistingTopicCurrentSubTopics([]);
    if (topicClass[0] && topicSubject[0]) {
      fetchTopicModeTopics(topicClass[0], topicSubject[0]);
    } else {
      setTopicModeTopics([]);
    }
  }, [topicClass, topicSubject]);

  // Sync existing subtopics when an existing topic is selected in Add Subtopics tab
  useEffect(() => {
    if (existingTopicId[0]) {
      fetchExistingTopicSubTopics(existingTopicId[0]);
    } else {
      setExistingTopicCurrentSubTopics([]);
    }
  }, [existingTopicId]);

  // Sync resource context topics list dynamically
  useEffect(() => {
    setSelectedTopicId([]); // Reset selection when parent dependencies change
    setSelectedSubTopicId([]);
    if (selectedClass[0] && selectedSubject[0]) {
      fetchTopics(selectedClass[0], selectedSubject[0]);
    } else { 
      setTopics([]); 
      setResourceSubTopics([]);
    }
  }, [selectedClass, selectedSubject]);

  // Sync resource subtopics when topic selection changes
  useEffect(() => {
    setSelectedSubTopicId([]);
    if (selectedTopicId[0]) {
      fetchResourceSubTopics(selectedTopicId[0]);
    } else {
      setResourceSubTopics([]);
    }
  }, [selectedTopicId]);

  // Sync quiz parameter topics list dynamically
  useEffect(() => {
    setQuizSelectedTopic([]); // Reset selection when parent dependencies change
    setQuizSubTopics([]);
    setQuizSelectedSubtopics([]);
    if (quizSelectedClass[0] && quizSelectedSubject[0]) {
      fetchQuizTopics(quizSelectedClass[0], quizSelectedSubject[0]);
    } else {
      setQuizTopics([]);
    }
    setQuizzes([]);
    setQuizQuestionCount(0);
  }, [quizSelectedClass, quizSelectedSubject]);

  // Sync quiz subtopics dynamically when quiz topic selection changes
  useEffect(() => {
    setQuizSelectedSubtopics([]);
    if (quizSelectedTopic[0]) {
      fetchQuizSubTopics(quizSelectedTopic[0]);
    } else {
      setQuizSubTopics([]);
    }
  }, [quizSelectedTopic]);

  // Sync active quizzes list
  useEffect(() => {
    if (quizSelectedClass[0] && quizSelectedSubject[0] && quizSelectedTopic[0]) {
      fetchQuizzes(quizSelectedClass[0], quizSelectedSubject[0], quizSelectedTopic[0]);
    } else { 
      setQuizzes([]); 
      setQuizQuestionCount(0);
    }
  }, [quizSelectedClass, quizSelectedSubject, quizSelectedTopic]);

  useEffect(() => {
    if (alert) { const t = setTimeout(() => setAlert(null), 4500); return () => clearTimeout(t); }
  }, [alert]);

  // Database Fetch Handlers
  const fetchInitialData = async () => {
    const { data: classData } = await supabase.from("classes").select("id, name").order("name");
    const { data: subjectData } = await supabase.from("subjects").select("id, name").order("name");
    setClasses(classData || []); 
    setSubjects(subjectData || []); 
  };

  const fetchTopics = async (classId: string, subjectId: string) => {
    const { data } = await supabase.from("topics")
      .select("id, name, description, class_id, subject_id, order_index")
      .eq("class_id", classId).eq("subject_id", subjectId).order("name");
    setTopics(data || []);
  };

  const fetchTopicModeTopics = async (classId: string, subjectId: string) => {
    const { data } = await supabase.from("topics")
      .select("id, name, description, class_id, subject_id, order_index")
      .eq("class_id", classId).eq("subject_id", subjectId).order("name");
    setTopicModeTopics(data || []);
  };

  const fetchExistingTopicSubTopics = async (topicId: string) => {
    try {
      let list: any[] = [];
      const { data, error } = await supabase
        .from("sub_topics")
        .select("*")
        .eq("topic_id", topicId)
        .order("order_index", { ascending: true })
        .order("name", { ascending: true });
      if (!error && data && data.length > 0) {
        list = data;
      } else {
        const { data: altData } = await supabase
          .from("subtopics")
          .select("*")
          .eq("topic_id", topicId);
        if (altData && altData.length > 0) {
          list = altData;
        }
      }
      setExistingTopicCurrentSubTopics(list);
    } catch {
      setExistingTopicCurrentSubTopics([]);
    }
  };

  const fetchResourceSubTopics = async (topicId: string) => {
    try {
      let list: any[] = [];
      const { data, error } = await supabase
        .from("sub_topics")
        .select("*")
        .eq("topic_id", topicId)
        .order("order_index", { ascending: true })
        .order("name", { ascending: true });
      if (!error && data && data.length > 0) {
        list = data;
      } else {
        const { data: altData } = await supabase
          .from("subtopics")
          .select("*")
          .eq("topic_id", topicId);
        if (altData && altData.length > 0) {
          list = altData;
        }
      }
      setResourceSubTopics(list);
    } catch {
      setResourceSubTopics([]);
    }
  };

  const fetchQuizTopics = async (classId: string, subjectId: string) => {
    const { data } = await supabase.from("topics")
      .select("id, name, description, class_id, subject_id, order_index")
      .eq("class_id", classId).eq("subject_id", subjectId).order("name");
    setQuizTopics(data || []);
  };

  const fetchQuizSubTopics = async (topicId: string) => {
    try {
      let list: any[] = [];
      const { data, error } = await supabase
        .from("sub_topics")
        .select("*")
        .eq("topic_id", topicId)
        .order("order_index", { ascending: true })
        .order("name", { ascending: true });
      if (!error && data && data.length > 0) {
        list = data;
      } else {
        const { data: altData } = await supabase
          .from("subtopics")
          .select("*")
          .eq("topic_id", topicId);
        if (altData && altData.length > 0) {
          list = altData;
        }
      }
      setQuizSubTopics(list);
      if (list.length > 0) {
        setQuizSelectedSubtopics((prev) => (prev.length > 0 && list.some(s => s.id === prev[0]) ? prev : [list[0].id]));
      }
    } catch {
      setQuizSubTopics([]);
    }
  };

  const fetchQuizzes = async (classId: string, subjectId: string, topicId: string) => {
    try {
      const { data, error } = await supabase
        .from("quizzes")
        .select("id, subject_id, topic_id, class_id, title")
        .eq("class_id", classId)
        .eq("subject_id", subjectId)
        .eq("topic_id", topicId);
      
      let quizList: Quiz[] = (data as any) || [];
      if (error) {
        const { data: fallbackData } = await supabase
          .from("quizzes")
          .select("id, subject_id, topic_id, class_id")
          .eq("class_id", classId)
          .eq("subject_id", subjectId)
          .eq("topic_id", topicId);
        quizList = (fallbackData as any) || [];
      }
      setQuizzes(quizList);

      if (quizList.length > 0) {
        const quizIds = quizList.map((q) => q.id);
        const { data: qRows } = await supabase
          .from("questions")
          .select("id")
          .in("quiz_id", quizIds);

        setQuizQuestionCount(qRows ? qRows.length : 0);
      } else {
        // Fallback: check questions directly by topic_id
        const { data: topicQRows } = await supabase
          .from("questions")
          .select("id")
          .eq("topic_id", topicId);

        setQuizQuestionCount(topicQRows ? topicQRows.length : 0);
      }
    } catch {
      setQuizzes([]);
      setQuizQuestionCount(0);
    }
  };

  // ── Subtopics Dynamic Input Row Helpers ──
  const addSubTopicRow = () => {
    setSubTopicsList((p) => [
      ...p,
      { id: Math.random().toString(36).substring(2), name: "", desc: "" },
    ]);
  };

  const removeSubTopicRow = (index: number) => {
    if (subTopicsList.length > 1) {
      setSubTopicsList((p) => p.filter((_, i) => i !== index));
    } else {
      setSubTopicsList([{ id: "1", name: "", desc: "" }]);
    }
  };

  const updateSubTopicRow = (index: number, field: "name" | "desc", value: string) => {
    setSubTopicsList((p) =>
      p.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const addExistingSubTopicRow = () => {
    setExistingTopicSubList((p) => [
      ...p,
      { id: Math.random().toString(36).substring(2), name: "", desc: "" },
    ]);
  };

  const removeExistingSubTopicRow = (index: number) => {
    if (existingTopicSubList.length > 1) {
      setExistingTopicSubList((p) => p.filter((_, i) => i !== index));
    } else {
      setExistingTopicSubList([{ id: "1", name: "", desc: "" }]);
    }
  };

  const updateExistingSubTopicRow = (index: number, field: "name" | "desc", value: string) => {
    setExistingTopicSubList((p) =>
      p.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  // ── Standalone Topic Creator Function with Subtopics ──
  const handleCreateTopic = async () => {
    if (!topicClass[0] || !topicSubject[0] || !newTopicName.trim()) {
      setAlert({ type: "error", message: "Please fill all required topic fields." });
      return;
    }
    setTopicLoading(true);
    try {
      // 1. Insert Topic
      const { data: topicData, error: topicError } = await supabase
        .from("topics")
        .insert([{
          name: newTopicName.trim(),
          class_id: topicClass[0],
          subject_id: topicSubject[0],
          description: newTopicDescription.trim() || "Managed subject course component entry",
          order_index: 0
        }])
        .select("id, name")
        .single();

      if (topicError) throw topicError;

      // 2. Insert any defined Subtopics
      const validSubTopics = subTopicsList.filter((st) => st.name.trim().length > 0);
      let subTopicsSavedCount = 0;

      if (validSubTopics.length > 0 && topicData?.id) {
        const subTopicPayloads = validSubTopics.map((st, idx) => ({
          name: st.name.trim(),
          description: st.desc.trim() || "",
          topic_id: topicData.id,
          class_id: topicClass[0],
          subject_id: topicSubject[0],
          order_index: idx,
        }));

        const { error: subError } = await supabase
          .from("sub_topics")
          .insert(subTopicPayloads);

        if (subError) {
          console.warn("Subtopic creation notice:", subError.message);
        } else {
          subTopicsSavedCount = validSubTopics.length;
        }
      }

      setAlert({
        type: "success",
        message: `Topic "${newTopicName}" ${
          subTopicsSavedCount > 0 ? `with ${subTopicsSavedCount} subtopic(s)` : ""
        } saved successfully!`,
      });

      setNewTopicName("");
      setNewTopicDescription("");
      setSubTopicsList([{ id: "1", name: "", desc: "" }]);
      
      // Force an immediate refresh for whatever class/subject combination you just added a topic to!
      if (topicClass[0] && topicSubject[0]) {
        await fetchTopicModeTopics(topicClass[0], topicSubject[0]);
      }
      if (selectedClass[0] || selectedSubject[0]) {
        await fetchTopics(selectedClass[0] || topicClass[0], selectedSubject[0] || topicSubject[0]);
      }
      if (quizSelectedClass[0] || quizSelectedSubject[0]) {
        await fetchQuizTopics(quizSelectedClass[0] || topicClass[0], quizSelectedSubject[0] || topicSubject[0]);
      }
    } catch (err) {
      setAlert({ type: "error", message: "Topic Creation Error: " + (err as Error).message });
    } finally {
      setTopicLoading(false);
    }
  };

  // ── Add Subtopics to Existing Topic Function ──
  const handleAddSubTopicsToExistingTopic = async () => {
    if (!topicClass[0] || !topicSubject[0] || !existingTopicId[0]) {
      setAlert({ type: "error", message: "Please select target Class, Subject, and Topic." });
      return;
    }
    const validSubTopics = existingTopicSubList.filter((st) => st.name.trim().length > 0);
    if (validSubTopics.length === 0) {
      setAlert({ type: "error", message: "Please enter at least one subtopic name." });
      return;
    }

    setExistingSubLoading(true);
    try {
      const subTopicPayloads = validSubTopics.map((st, idx) => ({
        name: st.name.trim(),
        description: st.desc.trim() || "",
        topic_id: existingTopicId[0],
        class_id: topicClass[0],
        subject_id: topicSubject[0],
        order_index: idx,
      }));

      const { error: subError } = await supabase
        .from("sub_topics")
        .insert(subTopicPayloads);

      if (subError) throw subError;

      setAlert({
        type: "success",
        message: `Successfully saved ${validSubTopics.length} subtopic(s) to topic!`,
      });
      setExistingTopicSubList([{ id: "1", name: "", desc: "" }]);

      // Refresh existing topic subtopics as well as resource and quiz subtopics immediately
      await fetchExistingTopicSubTopics(existingTopicId[0]);
      await fetchResourceSubTopics(existingTopicId[0]);
      await fetchQuizSubTopics(existingTopicId[0]);
    } catch (err: any) {
      setAlert({ type: "error", message: "Failed to add subtopics: " + err.message });
    } finally {
      setExistingSubLoading(false);
    }
  };

  // ── Bulk Topic & Subtopic Import Handlers ──
  const totalBulkSubtopicsCount = useMemo(() => {
    return bulkParsedTopics.reduce((sum, t) => sum + t.subtopics.length, 0);
  }, [bulkParsedTopics]);

  const removeBulkParsedTopic = (indexToRemove: number) => {
    setBulkParsedTopics((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const downloadTopicTemplate = (format: "xlsx" | "csv" = "xlsx") => {
    const sampleRows = [
      {
        topic_name: "Algebraic Processes",
        topic_description: "Operations on algebraic expressions, equations, and inequalities",
        subtopic_name: "Simultaneous Linear Equations",
        subtopic_description: "Solving linear systems via elimination and substitution methods",
      },
      {
        topic_name: "Algebraic Processes",
        topic_description: "",
        subtopic_name: "Quadratic Equations",
        subtopic_description: "Factorization, completing the square, and quadratic formula",
      },
      {
        topic_name: "Algebraic Processes",
        topic_description: "",
        subtopic_name: "Linear Inequalities in One Variable",
        subtopic_description: "Graphing and solving linear inequalities on number lines",
      },
      {
        topic_name: "Plane Geometry & Trigonometry",
        topic_description: "Properties of geometric figures, angles, and trigonometric ratios",
        subtopic_name: "Trigonometric Ratios",
        subtopic_description: "Sine, cosine, and tangent ratios for acute angles in right triangles",
      },
      {
        topic_name: "Plane Geometry & Trigonometry",
        topic_description: "",
        subtopic_name: "Angles of Elevation and Depression",
        subtopic_description: "Application of trigonometry to real-world surveying and height calculations",
      },
      {
        topic_name: "Plane Geometry & Trigonometry",
        topic_description: "",
        subtopic_name: "Circle Theorems",
        subtopic_description: "Angles at center, angles in same segment, and cyclic quadrilaterals",
      },
      {
        topic_name: "Statistics & Data Presentation",
        topic_description: "Measures of central tendency, dispersion, and theoretical probability",
        subtopic_name: "Mean, Median & Mode of Grouped Data",
        subtopic_description: "Calculating averages from frequency distribution tables",
      },
      {
        topic_name: "Statistics & Data Presentation",
        topic_description: "",
        subtopic_name: "Theoretical and Experimental Probability",
        subtopic_description: "Sample spaces, mutually exclusive events, and independent events",
      },
    ];

    if (format === "xlsx") {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(sampleRows);
      ws["!cols"] = [
        { wch: 32 },
        { wch: 45 },
        { wch: 35 },
        { wch: 55 },
      ];
      XLSX.utils.book_append_sheet(wb, ws, "Curriculum_Import");
      XLSX.writeFile(wb, "topics_and_subtopics_template.xlsx");
    } else {
      const headers = ["topic_name", "topic_description", "subtopic_name", "subtopic_description"];
      const csvLines = [
        headers.join(","),
        ...sampleRows.map((r) => [
          `"${r.topic_name.replace(/"/g, '""')}"`,
          `"${r.topic_description.replace(/"/g, '""')}"`,
          `"${r.subtopic_name.replace(/"/g, '""')}"`,
          `"${r.subtopic_description.replace(/"/g, '""')}"`,
        ].join(",")),
      ];
      const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "topics_and_subtopics_template.csv";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const parseTopicSpreadsheetFile = (file: File) => {
    setBulkImportFileName(file.name);
    setBulkImportError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const sheetName = wb.SheetNames[0];
        if (!sheetName) {
          setBulkImportError("The uploaded workbook has no sheets.");
          return;
        }
        const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(wb.Sheets[sheetName], { defval: "" });

        if (!rawRows || rawRows.length === 0) {
          setBulkImportError("The spreadsheet is empty. Please ensure it contains topic headers and rows.");
          return;
        }

        const topicMap = new Map<string, BulkParsedTopic>();
        let currentTopicKey: string | null = null;

        for (const rawRow of rawRows) {
          const row: Record<string, string> = {};
          for (const k of Object.keys(rawRow)) {
            row[k.trim().toLowerCase()] = String(rawRow[k] ?? "").trim();
          }

          // Detect topic name
          const topicName =
            row["topic_name"] ||
            row["topic"] ||
            row["topic title"] ||
            row["topictitle"] ||
            row["course_topic"] ||
            row["course topic"] ||
            row["topic_title"] ||
            "";

          // Detect topic description
          const topicDesc =
            row["topic_description"] ||
            row["topic_desc"] ||
            row["topic description"] ||
            row["topic summary"] ||
            "";

          // Detect subtopic name
          const subtopicName =
            row["subtopic_name"] ||
            row["subtopic"] ||
            row["sub_topic"] ||
            row["sub topic"] ||
            row["sub_topic_name"] ||
            row["subtopic title"] ||
            "";

          // Detect subtopic description
          const subtopicDesc =
            row["subtopic_description"] ||
            row["subtopic_desc"] ||
            row["subtopic description"] ||
            row["sub_topic_desc"] ||
            row["description"] ||
            row["desc"] ||
            "";

          // If topicName is present, update current active topic
          const effectiveTopicName = topicName || (currentTopicKey ? topicMap.get(currentTopicKey)?.topicName : null);

          if (!effectiveTopicName) {
            continue;
          }

          const topicKey = effectiveTopicName.toLowerCase();
          currentTopicKey = topicKey;

          if (!topicMap.has(topicKey)) {
            topicMap.set(topicKey, {
              topicName: effectiveTopicName,
              topicDescription: topicDesc,
              subtopics: [],
            });
          } else if (topicDesc && !topicMap.get(topicKey)!.topicDescription) {
            topicMap.get(topicKey)!.topicDescription = topicDesc;
          }

          if (subtopicName) {
            const currentSubtopics = topicMap.get(topicKey)!.subtopics;
            const subKey = subtopicName.toLowerCase();
            if (!currentSubtopics.some((s) => s.name.toLowerCase() === subKey)) {
              currentSubtopics.push({
                name: subtopicName,
                description: subtopicDesc,
              });
            }
          }
        }

        const parsedList = Array.from(topicMap.values());
        if (parsedList.length === 0) {
          setBulkImportError("No topics found in file. Please ensure column header 'topic_name' or 'topic' exists.");
          return;
        }

        setBulkParsedTopics(parsedList);
      } catch (err: any) {
        setBulkImportError("Failed to parse spreadsheet: " + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const parseTopicOutlineText = (rawText: string) => {
    setBulkImportError(null);
    if (!rawText.trim()) {
      setBulkParsedTopics([]);
      return;
    }

    try {
      const lines = rawText.split(/\r?\n/);
      const topicMap = new Map<string, BulkParsedTopic>();
      let activeTopic: BulkParsedTopic | null = null;

      // Check if text is table/delimited (pipes or tabs)
      const hasDelimiters = lines.some((l) => l.includes("|") || l.includes("\t"));

      if (hasDelimiters) {
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#") || trimmed.toLowerCase().startsWith("topic_name")) continue;
          
          const delimiter = trimmed.includes("\t") ? "\t" : "|";
          const cols = trimmed.split(delimiter).map((c) => c.trim());
          if (cols.length === 0) continue;

          let tName = "";
          let tDesc = "";
          let sName = "";
          let sDesc = "";

          if (cols.length >= 4) {
            tName = cols[0];
            tDesc = cols[1];
            sName = cols[2];
            sDesc = cols[3];
          } else if (cols.length === 3) {
            tName = cols[0];
            sName = cols[1];
            sDesc = cols[2];
          } else if (cols.length === 2) {
            tName = cols[0];
            sName = cols[1];
          } else {
            tName = cols[0];
          }

          if (!tName) continue;
          const tKey = tName.toLowerCase();
          if (!topicMap.has(tKey)) {
            topicMap.set(tKey, {
              topicName: tName,
              topicDescription: tDesc,
              subtopics: [],
            });
          }
          if (sName) {
            const subs = topicMap.get(tKey)!.subtopics;
            if (!subs.some((s) => s.name.toLowerCase() === sName.toLowerCase())) {
              subs.push({ name: sName, description: sDesc });
            }
          }
        }
      } else {
        // Hierarchical / Outline style
        for (let i = 0; i < lines.length; i++) {
          const rawLine = lines[i];
          const trimmed = rawLine.trim();
          if (!trimmed) continue;

          const isIndented = rawLine.startsWith("  ") || rawLine.startsWith("\t");
          const isBullet = /^[-\*+•]\s+/.test(trimmed) || /^\d+[\.\)]\s+/.test(trimmed);

          if (isBullet || (isIndented && activeTopic)) {
            if (!activeTopic) {
              activeTopic = {
                topicName: "General Topics",
                topicDescription: "",
                subtopics: [],
              };
              topicMap.set("general topics", activeTopic);
            }

            const cleanSubLine = trimmed.replace(/^[-\*+•]\s+/, "").replace(/^\d+[\.\)]\s+/, "").trim();
            if (!cleanSubLine) continue;

            let subName = cleanSubLine;
            let subDesc = "";
            if (cleanSubLine.includes(":") && !cleanSubLine.toLowerCase().startsWith("http")) {
              const colonIdx = cleanSubLine.indexOf(":");
              subName = cleanSubLine.substring(0, colonIdx).trim();
              subDesc = cleanSubLine.substring(colonIdx + 1).trim();
            } else if (cleanSubLine.includes(" - ")) {
              const dashIdx = cleanSubLine.indexOf(" - ");
              subName = cleanSubLine.substring(0, dashIdx).trim();
              subDesc = cleanSubLine.substring(dashIdx + 3).trim();
            }

            if (subName) {
              if (!activeTopic.subtopics.some((s) => s.name.toLowerCase() === subName.toLowerCase())) {
                activeTopic.subtopics.push({ name: subName, description: subDesc });
              }
            }
          } else {
            // It's a Topic declaration
            let tName = trimmed;
            let tDesc = "";

            if (tName.toLowerCase().startsWith("topic:")) {
              tName = tName.substring(6).trim();
            } else if (tName.startsWith("# ")) {
              tName = tName.substring(2).trim();
            } else if (tName.startsWith("## ")) {
              tName = tName.substring(3).trim();
            }

            // Check if next line is a Description: line
            if (i + 1 < lines.length) {
              const nextTrimmed = lines[i + 1].trim();
              if (nextTrimmed.toLowerCase().startsWith("description:") || nextTrimmed.toLowerCase().startsWith("desc:")) {
                const colonIdx = nextTrimmed.indexOf(":");
                tDesc = nextTrimmed.substring(colonIdx + 1).trim();
                i++; // skip next line
              }
            }

            if (!tName) continue;
            const tKey = tName.toLowerCase();
            if (!topicMap.has(tKey)) {
              activeTopic = {
                topicName: tName,
                topicDescription: tDesc,
                subtopics: [],
              };
              topicMap.set(tKey, activeTopic);
            } else {
              activeTopic = topicMap.get(tKey)!;
              if (tDesc && !activeTopic.topicDescription) {
                activeTopic.topicDescription = tDesc;
              }
            }
          }
        }
      }

      const parsedList = Array.from(topicMap.values());
      setBulkParsedTopics(parsedList);
    } catch (err: any) {
      setBulkImportError("Error parsing outline text: " + err.message);
    }
  };

  const handleExecuteBulkImport = async () => {
    if (!topicClass[0] || !topicSubject[0]) {
      setAlert({ type: "error", message: "Please select Target Class and Target Subject first." });
      return;
    }
    if (bulkParsedTopics.length === 0) {
      setAlert({ type: "error", message: "No topics or subtopics parsed to import." });
      return;
    }

    setBulkImportLoading(true);
    setBulkImportError(null);

    let createdTopicsCount = 0;
    let reusedTopicsCount = 0;
    let createdSubtopicsCount = 0;
    let skippedSubtopicsCount = 0;

    try {
      // 1. Fetch current topics in DB for this class + subject to find matches and max order_index
      const { data: currentTopicsData } = await supabase
        .from("topics")
        .select("id, name, order_index")
        .eq("class_id", topicClass[0])
        .eq("subject_id", topicSubject[0]);

      const existingTopics = (currentTopicsData || []).map((t: any) => ({
        id: t.id,
        name: t.name,
        order_index: typeof t.order_index === "number" ? t.order_index : 0,
      }));

      let nextTopicOrder = existingTopics.reduce((max, t) => Math.max(max, t.order_index || 0), 0) + 1;

      for (const item of bulkParsedTopics) {
        const trimmedTopicName = item.topicName.trim();
        if (!trimmedTopicName) continue;

        // Check if topic exists in DB (case-insensitive name match)
        const matchedTopic = existingTopics.find(
          (t) => t.name.trim().toLowerCase() === trimmedTopicName.toLowerCase()
        );

        let topicId: string;

        if (matchedTopic) {
          topicId = matchedTopic.id;
          reusedTopicsCount++;
        } else {
          // Insert new topic
          const { data: newTopic, error: topicErr } = await supabase
            .from("topics")
            .insert([{
              name: trimmedTopicName,
              description: item.topicDescription.trim() || "Managed subject course component entry",
              class_id: topicClass[0],
              subject_id: topicSubject[0],
              order_index: nextTopicOrder++,
            }])
            .select("id, name")
            .single();

          if (topicErr) throw new Error(`Failed to create topic "${trimmedTopicName}": ${topicErr.message}`);
          topicId = newTopic.id;
          createdTopicsCount++;
          existingTopics.push({ id: topicId, name: trimmedTopicName, order_index: nextTopicOrder });
        }

        // 2. Now process subtopics for this topic
        const validSubs = item.subtopics.filter((st) => st.name.trim().length > 0);
        if (validSubs.length > 0) {
          // Fetch existing subtopics for this topic to avoid duplicate inserts
          let currentSubs: { id: string; name: string; order_index?: number }[] = [];
          const { data: dbSubs, error: subFetchErr } = await supabase
            .from("sub_topics")
            .select("id, name, order_index")
            .eq("topic_id", topicId);

          if (!subFetchErr && dbSubs) {
            currentSubs = dbSubs;
          } else {
            const { data: altSubs } = await supabase
              .from("subtopics")
              .select("id, name, order_index")
              .eq("topic_id", topicId);
            if (altSubs) currentSubs = altSubs;
          }

          let nextSubOrder = currentSubs.reduce((max, s) => Math.max(max, s.order_index || 0), 0) + 1;

          // Filter out subtopics that already exist for this topic
          const subsToInsert = validSubs.filter((st) => {
            const exists = currentSubs.some(
              (cs) => cs.name.trim().toLowerCase() === st.name.trim().toLowerCase()
            );
            if (exists) {
              skippedSubtopicsCount++;
              return false;
            }
            return true;
          });

          if (subsToInsert.length > 0) {
            const subPayloads = subsToInsert.map((st) => ({
              name: st.name.trim(),
              description: st.description.trim() || "",
              topic_id: topicId,
              class_id: topicClass[0],
              subject_id: topicSubject[0],
              order_index: nextSubOrder++,
            }));

            const { error: subInsertErr } = await supabase
              .from("sub_topics")
              .insert(subPayloads);

            if (subInsertErr) {
              const { error: altInsertErr } = await supabase
                .from("subtopics")
                .insert(subPayloads);
              if (altInsertErr) {
                console.warn("Subtopic insert error:", altInsertErr.message);
              } else {
                createdSubtopicsCount += subsToInsert.length;
              }
            } else {
              createdSubtopicsCount += subsToInsert.length;
            }
          }
        }
      }

      // Refresh all related topic and subtopic caches
      await fetchTopicModeTopics(topicClass[0], topicSubject[0]);
      if (selectedClass[0] || selectedSubject[0]) {
        await fetchTopics(selectedClass[0] || topicClass[0], selectedSubject[0] || topicSubject[0]);
      }
      if (quizSelectedClass[0] || quizSelectedSubject[0]) {
        await fetchQuizTopics(quizSelectedClass[0] || topicClass[0], quizSelectedSubject[0] || topicSubject[0]);
      }

      const targetClassName = classes.find((c) => c.id === topicClass[0])?.name || "Class";
      const targetSubjectName = subjects.find((s) => s.id === topicSubject[0])?.name || "Subject";

      const parts: string[] = [];
      if (createdTopicsCount > 0) parts.push(`${createdTopicsCount} new topic(s) created`);
      if (reusedTopicsCount > 0) parts.push(`${reusedTopicsCount} existing topic(s) updated`);
      if (createdSubtopicsCount > 0) parts.push(`${createdSubtopicsCount} subtopic(s) added`);
      if (skippedSubtopicsCount > 0) parts.push(`${skippedSubtopicsCount} duplicate subtopic(s) skipped`);

      setAlert({
        type: "success",
        message: `Bulk Import Complete for ${targetClassName} — ${targetSubjectName}: ${parts.join(", ") || "No changes needed"}.`,
      });

      // Clear draft
      setBulkImportFileName(null);
      setBulkImportText("");
      setBulkParsedTopics([]);
    } catch (err: any) {
      console.error("Bulk import failed:", err);
      setAlert({ type: "error", message: "Bulk Import Error: " + err.message });
      setBulkImportError(err.message);
    } finally {
      setBulkImportLoading(false);
    }
  };

  // ── Resource Upload Handlers ──
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (accepted) => setFiles((p) => [...p, ...accepted]),
    multiple: false,
  });
  const removeFile = (i: number) => setFiles((p) => p.filter((_, j) => j !== i));

  const {
    getRootProps: getBatchRootProps,
    getInputProps: getBatchInputProps,
    isDragActive: isBatchDragActive,
  } = useDropzone({
    onDrop: (accepted) => handleAddBatchFiles(accepted),
    multiple: true,
  });

  const uploadFileToSupabase = async (file: File, type: string) => {
    const folder = type === "video" ? "Videos" : type === "pqs" ? "PastQuestions" : "PDFs";
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    const path = `${folder}/${Math.random().toString(36).substring(2)}_${Date.now()}.${ext}`;
    const mimeType = ext === "pdf" ? "application/pdf" : ext === "mp4" ? "video/mp4" : ext === "webm" ? "video/webm" : file.type || "application/octet-stream";
    const { error } = await supabase.storage.from("test-resource").upload(path, file, {
      contentType: mimeType,
      upsert: true,
    });
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from("test-resource").getPublicUrl(path);
    return publicUrl;
  };

  const handleUploadResource = async () => {
    if (!files.length || !selectedClass[0] || !selectedSubject[0] || !selectedTopicId[0] || !fileType[0]) {
      setAlert({ type: "error", message: "Please resolve all core selection fields prior to final asset save." }); return;
    }
    setLoading(true);
    try {
      const selectedTopicObj = topics.find(t => t.id === selectedTopicId[0]);
      const selectedSubTopicObj = resourceSubTopics.find(st => st.id === selectedSubTopicId[0]);

      let resourceTitle = selectedTopicObj ? selectedTopicObj.name : "Resource Item";
      if (selectedSubTopicObj) {
        resourceTitle = `${selectedTopicObj?.name || ""} — ${selectedSubTopicObj.name}`;
      }

      const fileUrl = await uploadFileToSupabase(files[0], fileType[0]);
      
      const resourceDesc = description.trim() 
        ? (selectedSubTopicObj ? `${description.trim()} (Subtopic: ${selectedSubTopicObj.name})` : description.trim())
        : (selectedSubTopicObj ? `Subtopic: ${selectedSubTopicObj.name}` : "");

      const insertPayload: any = {
        class_id: selectedClass[0], 
        subject_id: selectedSubject[0], 
        topic_id: selectedTopicId[0],
        title: resourceTitle,
        description: resourceDesc, 
        type: fileType[0], 
        duration: 0, 
        order_index: 0, 
        url: fileUrl,
      };

      const { error } = await supabase.from("resources").insert([insertPayload]);
      
      if (error) throw error;
      setAlert({ type: "success", message: "Resource saved effectively!" });
      setFiles([]); setFileType([]); setSelectedClass([]); setSelectedSubject([]); setSelectedTopicId([]); setSelectedSubTopicId([]);
      setDescription("");
    } catch (err) {
      setAlert({ type: "error", message: "Upload failed: " + (err as Error).message });
    } finally { setLoading(false); }
  };

  // ── Academic Resources Bulk / Batch Handlers ──
  const handleAddBatchFiles = (accepted: File[]) => {
    if (!accepted || accepted.length === 0) return;
    const newItems: BatchResourceFileItem[] = accepted.map((file) => {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      let detectedType: "pdf" | "video" | "pqs" = "pdf";
      if (["mp4", "webm", "mov", "mkv", "avi", "m4v"].includes(ext)) {
        detectedType = "video";
      } else if (fileType[0] === "pqs") {
        detectedType = "pqs";
      }

      let cleanTitle = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/^[0-9]+[._\s-]+/, "")
        .replace(/[_-]+/g, " ")
        .trim();
      if (!cleanTitle) cleanTitle = file.name;

      return {
        id: Math.random().toString(36).substring(2),
        file,
        name: file.name,
        title: cleanTitle,
        type: detectedType,
        topicId: selectedTopicId[0] || (topics[0]?.id ?? ""),
        subTopicId: selectedSubTopicId[0] || "",
        description: "",
        status: "queued",
      };
    });

    setBatchResourceFiles((prev) => [...prev, ...newItems]);
  };

  const removeBatchFile = (index: number) => {
    setBatchResourceFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const updateBatchFile = (index: number, key: keyof BatchResourceFileItem, value: any) => {
    setBatchResourceFiles((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [key]: value } : item))
    );
  };

  const applyTopicToAllBatchFiles = (targetTopicId: string, targetSubTopicId: string = "") => {
    if (!targetTopicId) return;
    setBatchResourceFiles((prev) =>
      prev.map((item) => ({
        ...item,
        topicId: targetTopicId,
        subTopicId: targetSubTopicId,
      }))
    );
  };

  const handleUploadBatchFiles = async () => {
    if (!selectedClass[0] || !selectedSubject[0]) {
      setAlert({ type: "error", message: "Please select Class and Subject first." });
      return;
    }
    const pendingFiles = batchResourceFiles.filter((f) => f.status !== "done");
    if (pendingFiles.length === 0) {
      setAlert({ type: "error", message: "No queued files to upload." });
      return;
    }

    const missingTopic = batchResourceFiles.some(
      (f) => f.status !== "done" && !f.topicId && !selectedTopicId[0]
    );
    if (missingTopic) {
      setAlert({
        type: "error",
        message: "Please assign a topic to all queued files before uploading.",
      });
      return;
    }

    setBatchUploading(true);
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < batchResourceFiles.length; i++) {
      const item = batchResourceFiles[i];
      if (item.status === "done") continue;

      const targetTopicId = item.topicId || selectedTopicId[0];

      setBatchResourceFiles((prev) =>
        prev.map((f, idx) => (idx === i ? { ...f, status: "uploading" } : f))
      );

      try {
        const fileUrl = await uploadFileToSupabase(item.file, item.type);
        const selectedSubTopicObj = resourceSubTopics.find(
          (st) => st.id === (item.subTopicId || selectedSubTopicId[0])
        );

        let finalTitle = item.title.trim() || item.name;
        if (selectedSubTopicObj && !finalTitle.includes(selectedSubTopicObj.name)) {
          finalTitle = `${finalTitle} — ${selectedSubTopicObj.name}`;
        }

        const resourceDesc = item.description?.trim()
          ? (selectedSubTopicObj ? `${item.description.trim()} (Subtopic: ${selectedSubTopicObj.name})` : item.description.trim())
          : (selectedSubTopicObj ? `Subtopic: ${selectedSubTopicObj.name}` : "");

        const insertPayload = {
          class_id: selectedClass[0],
          subject_id: selectedSubject[0],
          topic_id: targetTopicId,
          title: finalTitle,
          description: resourceDesc,
          type: item.type,
          duration: 0,
          order_index: i,
          url: fileUrl,
        };

        const { error } = await supabase.from("resources").insert([insertPayload]);
        if (error) throw error;

        setBatchResourceFiles((prev) =>
          prev.map((f, idx) => (idx === i ? { ...f, status: "done" } : f))
        );
        successCount++;
      } catch (err: any) {
        console.error("File upload error:", err);
        setBatchResourceFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: "error", errorMsg: err.message || "Failed" } : f
          )
        );
        errorCount++;
      }
    }

    setBatchUploading(false);
    if (successCount > 0) {
      setAlert({
        type: "success",
        message: `Batch Upload Complete: ${successCount} resource(s) uploaded successfully!${errorCount > 0 ? ` (${errorCount} failed)` : ""}`,
      });
    } else if (errorCount > 0) {
      setAlert({
        type: "error",
        message: `Batch Upload Failed for ${errorCount} file(s). Please review individual item errors.`,
      });
    }
  };

  const downloadResourceTemplate = (format: "xlsx" | "csv" = "xlsx") => {
    const sampleRows = [
      {
        title: "Simultaneous Linear Equations Video Tutorial",
        type: "video",
        file_name: "simultaneous_linear_equations.mp4",
        topic_name: "Algebraic Processes",
        subtopic_name: "Simultaneous Linear Equations",
        description: "Complete walkthrough on solving systems using substitution and elimination",
      },
      {
        title: "Quadratic Equations Revision Notes & Practice Sheet",
        type: "pdf",
        file_name: "quadratic_equations_notes.pdf",
        topic_name: "Algebraic Processes",
        subtopic_name: "Quadratic Equations",
        description: "Formulas, worked exam problems, and practice questions with answer keys",
      },
      {
        title: "Circle Theorems Masterclass & Visual Proofs",
        type: "video",
        file_name: "circle_theorems_proofs.mp4",
        topic_name: "Plane Geometry & Trigonometry",
        subtopic_name: "Circle Theorems",
        description: "Interactive visual demonstrations of angles at center, semicircle, and tangents",
      },
      {
        title: "Plane Geometry & Trigonometry Formula Compendium",
        type: "pdf",
        file_name: "trig_geometry_handout.pdf",
        topic_name: "Plane Geometry & Trigonometry",
        subtopic_name: "Trigonometric Ratios",
        description: "Key identity ratios and geometric theorems quick reference guide",
      },
      {
        title: "Past Exam Questions Collection (1995-2024)",
        type: "pqs",
        file_name: "past_questions_compilation.pdf",
        topic_name: "Algebraic Processes",
        subtopic_name: "",
        description: "Comprehensive compilation of past examination questions",
      },
    ];

    if (format === "xlsx") {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(sampleRows);
      ws["!cols"] = [
        { wch: 40 },
        { wch: 12 },
        { wch: 35 },
        { wch: 32 },
        { wch: 32 },
        { wch: 55 },
      ];
      XLSX.utils.book_append_sheet(wb, ws, "Academic_Resources");
      XLSX.writeFile(wb, "academic_resources_template.xlsx");
    } else {
      const headers = ["title", "type", "file_name", "topic_name", "subtopic_name", "description"];
      const csvLines = [
        headers.join(","),
        ...sampleRows.map((r) => [
          `"${r.title.replace(/"/g, '""')}"`,
          `"${r.type.replace(/"/g, '""')}"`,
          `"${r.file_name.replace(/"/g, '""')}"`,
          `"${r.topic_name.replace(/"/g, '""')}"`,
          `"${r.subtopic_name.replace(/"/g, '""')}"`,
          `"${r.description.replace(/"/g, '""')}"`,
        ].join(",")),
      ];
      const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "academic_resources_template.csv";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Helper to normalize topic string for flexible matching
  const normalizeTopicString = (str: string): string => {
    return (str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/^(topic|unit|chapter|module|section|week|lecture)\s*\d+[\s:.-]*/i, "")
      .replace(/^\d+[\s:.-]+/, "")
      .replace(/[^a-z0-9]/g, "")
      .trim();
  };

  // Resilient topic matcher against existing topics in state or database
  const findMatchingTopic = (
    topicName: string,
    availableTopics: { id: string; name: string }[]
  ): { id: string; name: string } | undefined => {
    const trimmed = (topicName || "").trim();
    if (!trimmed) return undefined;

    // 1. Exact case-insensitive match
    const exact = availableTopics.find(
      (t) => t.name.trim().toLowerCase() === trimmed.toLowerCase()
    );
    if (exact) return exact;

    // 2. Normalized match (ignoring numbering, punctuation, extra whitespace, accents)
    const normTarget = normalizeTopicString(trimmed);
    if (normTarget) {
      const normMatch = availableTopics.find(
        (t) => normalizeTopicString(t.name) === normTarget
      );
      if (normMatch) return normMatch;

      // 3. Substring match for names with sufficient length
      if (normTarget.length >= 4) {
        const subMatch = availableTopics.find((t) => {
          const nt = normalizeTopicString(t.name);
          return nt.length >= 4 && (nt.includes(normTarget) || normTarget.includes(nt));
        });
        if (subMatch) return subMatch;
      }
    }

    return undefined;
  };

  const parseResourceSpreadsheetFile = (file: File) => {
    setBulkResourceFileName(file.name);
    setBulkResourceImportError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const sheetName = wb.SheetNames[0];
        if (!sheetName) {
          setBulkResourceImportError("The uploaded workbook has no sheets.");
          return;
        }
        const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(wb.Sheets[sheetName], { defval: "" });
        if (!rawRows || rawRows.length === 0) {
          setBulkResourceImportError("The spreadsheet is empty. Please ensure it contains resource headers and rows.");
          return;
        }

        const parsedList: BulkParsedResource[] = [];

        rawRows.forEach((rawRow, idx) => {
          const row: Record<string, string> = {};
          for (const k of Object.keys(rawRow)) {
            const val = String(rawRow[k] ?? "").trim();
            row[k.trim().toLowerCase()] = val;
            row[k.trim().toLowerCase().replace(/[\s_-]+/g, "")] = val;
          }

          const title =
            row["title"] ||
            row["resource_title"] ||
            row["resource title"] ||
            row["resourcetitle"] ||
            row["document_title"] ||
            row["document title"] ||
            row["documenttitle"] ||
            row["name"] ||
            "";

          const rawType = (
            row["type"] ||
            row["file_type"] ||
            row["file type"] ||
            row["filetype"] ||
            row["format"] ||
            "pdf"
          ).toLowerCase();

          let type: "pdf" | "video" | "pqs" = "pdf";
          if (rawType.includes("vid") || rawType.includes("mp4") || rawType.includes("youtube")) {
            type = "video";
          } else if (rawType.includes("pq") || rawType.includes("past")) {
            type = "pqs";
          }

          const fileName =
            row["file_name"] ||
            row["file name"] ||
            row["filename"] ||
            row["file"] ||
            row["files"] ||
            row["resource_file_name"] ||
            row["resource file name"] ||
            row["resourcefilename"] ||
            row["resource_file"] ||
            row["resource file"] ||
            row["resourcefile"] ||
            row["resource_name"] ||
            row["resource name"] ||
            row["resourcename"] ||
            row["asset_name"] ||
            row["asset name"] ||
            row["assetname"] ||
            row["attachment"] ||
            row["name"] ||
            "";

          const url =
            row["url"] ||
            row["link"] ||
            row["file_url"] ||
            row["file url"] ||
            row["fileurl"] ||
            row["download_url"] ||
            row["downloadurl"] ||
            row["web_url"] ||
            row["weburl"] ||
            "";

          const topicName =
            row["topic_name"] ||
            row["topic name"] ||
            row["topicname"] ||
            row["topic"] ||
            row["topics"] ||
            row["topic_title"] ||
            row["topic title"] ||
            row["topictitle"] ||
            row["course_topic"] ||
            row["course topic"] ||
            row["coursetopic"] ||
            row["course_topic_name"] ||
            row["course topic name"] ||
            row["coursetopicname"] ||
            row["chapter"] ||
            row["chapter_name"] ||
            row["chapter name"] ||
            row["chaptername"] ||
            row["module"] ||
            row["module_name"] ||
            row["module name"] ||
            row["modulename"] ||
            row["unit"] ||
            row["unit_name"] ||
            row["unit name"] ||
            row["unitname"] ||
            row["lesson_topic"] ||
            row["lesson topic"] ||
            row["lessontopic"] ||
            row["subject_topic"] ||
            row["subject topic"] ||
            row["subjecttopic"] ||
            "";

          const subTopicName =
            row["subtopic_name"] ||
            row["subtopic name"] ||
            row["subtopicname"] ||
            row["subtopic"] ||
            row["subtopics"] ||
            row["sub_topic"] ||
            row["sub topic"] ||
            row["sub_topic_name"] ||
            row["sub topic name"] ||
            row["subtopictitle"] ||
            row["sub_topic_title"] ||
            row["section"] ||
            row["section_name"] ||
            "";

          const description =
            row["description"] ||
            row["desc"] ||
            row["summary"] ||
            "";

          const finalTitle =
            title ||
            (fileName ? fileName.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ").trim() : `Resource Item ${idx + 1}`);

          if (!finalTitle && !fileName && !url) return;

          const matchedTopic = findMatchingTopic(topicName, topics);
          let matchedTopicId: string | undefined = undefined;
          let isNewTopic = false;
          let status: "ready" | "fallback" | "missing_topic" | "invalid_url" = "ready";

          if (!fileName && !url) {
            status = "invalid_url";
          } else if (matchedTopic) {
            matchedTopicId = matchedTopic.id;
            status = "ready";
          } else if (topicName.trim().length > 0) {
            // Topic provided in CSV/spreadsheet! It will be automatically synced & created in the database on import
            isNewTopic = true;
            status = "ready";
          } else if (selectedTopicId[0]) {
            matchedTopicId = selectedTopicId[0];
            status = "fallback";
          } else {
            status = "ready";
          }

          parsedList.push({
            id: `res-${idx}-${Math.random().toString(36).substring(2, 7)}`,
            title: finalTitle,
            type,
            fileName,
            url,
            topicName: topicName.trim(),
            subTopicName: subTopicName.trim(),
            description: description.trim(),
            matchedTopicId,
            isNewTopic,
            status,
          });
        });

        if (parsedList.length === 0) {
          setBulkResourceImportError("No valid rows could be extracted from this spreadsheet.");
          return;
        }

        setBulkParsedResources(parsedList);
      } catch (err: any) {
        setBulkResourceImportError("Failed to parse spreadsheet: " + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const parseResourceOutlineText = (rawText: string) => {
    setBulkResourceImportError(null);
    if (!rawText.trim()) {
      setBulkParsedResources([]);
      return;
    }

    try {
      const lines = rawText.split(/\r?\n/);
      const parsedList: BulkParsedResource[] = [];

      lines.forEach((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#") || trimmed.toLowerCase().startsWith("title")) return;

        const delimiter = trimmed.includes("\t") ? "\t" : trimmed.includes("|") ? "|" : ",";
        const cols = trimmed.split(delimiter).map((c) => c.trim().replace(/^["']|["']$/g, ""));
        if (cols.length === 0) return;

        const rawTitle = cols[0] || "";
        const rawType = (cols[1] || "pdf").toLowerCase();
        let type: "pdf" | "video" | "pqs" = "pdf";
        if (rawType.includes("vid") || rawType.includes("mp4") || rawType.includes("youtube")) {
          type = "video";
        } else if (rawType.includes("pq") || rawType.includes("past")) {
          type = "pqs";
        }

        const fileNameOrUrl = cols[2] || "";
        const isLikelyUrl = fileNameOrUrl.startsWith("http://") || fileNameOrUrl.startsWith("https://");
        const fileName = isLikelyUrl ? "" : fileNameOrUrl;
        const url = isLikelyUrl ? fileNameOrUrl : "";

        const topicName = cols[3] || "";
        const subTopicName = cols[4] || "";
        const description = cols[5] || "";

        const finalTitle =
          rawTitle ||
          (fileName ? fileName.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ").trim() : `Resource Item ${idx + 1}`);

        if (!finalTitle && !fileName && !url) return;

        const matchedTopic = findMatchingTopic(topicName, topics);
        let matchedTopicId: string | undefined = undefined;
        let isNewTopic = false;
        let status: "ready" | "fallback" | "missing_topic" | "invalid_url" = "ready";

        if (!fileName && !url) {
          status = "invalid_url";
        } else if (matchedTopic) {
          matchedTopicId = matchedTopic.id;
          status = "ready";
        } else if (topicName.trim().length > 0) {
          isNewTopic = true;
          status = "ready";
        } else if (selectedTopicId[0]) {
          matchedTopicId = selectedTopicId[0];
          status = "fallback";
        } else {
          status = "ready";
        }

        parsedList.push({
          id: `res-paste-${idx}-${Math.random().toString(36).substring(2, 7)}`,
          title: finalTitle,
          type,
          fileName,
          url,
          topicName: topicName.trim(),
          subTopicName: subTopicName.trim(),
          description: description.trim(),
          matchedTopicId,
          isNewTopic,
          status,
        });
      });

      setBulkParsedResources(parsedList);
    } catch (err: any) {
      setBulkResourceImportError("Failed to parse outline text: " + err.message);
    }
  };

  const removeBulkParsedResource = (index: number) => {
    setBulkParsedResources((prev) => prev.filter((_, i) => i !== index));
  };

  const commitBulkResourceImport = async () => {
    if (!selectedClass[0] || !selectedSubject[0]) {
      setAlert({ type: "error", message: "Please select Target Class and Target Subject first." });
      return;
    }
    if (bulkParsedResources.length === 0) {
      setAlert({ type: "error", message: "No parsed resources available to import." });
      return;
    }

    // Validate that files referenced in the sheet are uploaded in bulkResourceAttachedFiles
    const missingFiles: string[] = [];
    for (const res of bulkParsedResources) {
      if (res.fileName) {
        const isPresent = bulkResourceAttachedFiles.some(
          (f) => f.name.toLowerCase() === res.fileName.toLowerCase()
        );
        if (!isPresent && !res.url) {
          if (!missingFiles.includes(res.fileName)) {
            missingFiles.push(res.fileName);
          }
        }
      } else if (!res.url) {
        missingFiles.push(`(Missing file for "${res.title}")`);
      }
    }

    if (missingFiles.length > 0) {
      setAlert({
        type: "error",
        message: `Missing ${missingFiles.length} file(s) in Step 2: ${missingFiles.slice(0, 4).join(", ")}${missingFiles.length > 4 ? "..." : ""}. Please select and upload them before importing.`,
      });
      return;
    }

    setBulkResourceImportLoading(true);
    try {
      // 1. Fetch current topics from database for target class and subject
      const { data: currentTopicsData, error: topicFetchErr } = await supabase
        .from("topics")
        .select("id, name, order_index")
        .eq("class_id", selectedClass[0])
        .eq("subject_id", selectedSubject[0]);

      if (topicFetchErr) throw topicFetchErr;

      const currentTopicsList = (currentTopicsData || []).map((t: any) => ({
        id: t.id,
        name: t.name,
        order_index: typeof t.order_index === "number" ? t.order_index : 0,
      }));

      let nextTopicOrder = currentTopicsList.reduce((max, t) => Math.max(max, t.order_index || 0), 0) + 1;
      let newlyCreatedTopicsCount = 0;
      let newlyCreatedSubtopicsCount = 0;

      const topicNameToIdMap: Record<string, string> = {};
      currentTopicsList.forEach((t) => {
        topicNameToIdMap[t.name.trim().toLowerCase()] = t.id;
        const norm = normalizeTopicString(t.name);
        if (norm) topicNameToIdMap[norm] = t.id;
      });

      const subtopicCache: Record<string, Set<string>> = {};

      const resolveAndSyncTopicId = async (rawTopicName?: string): Promise<string> => {
        const trimmed = (rawTopicName || "").trim();
        if (!trimmed) {
          if (selectedTopicId[0]) return selectedTopicId[0];
          if (currentTopicsList.length > 0) return currentTopicsList[0].id;
          return await resolveAndSyncTopicId("General Course Resources");
        }

        const lower = trimmed.toLowerCase();
        if (topicNameToIdMap[lower]) return topicNameToIdMap[lower];

        const norm = normalizeTopicString(trimmed);
        if (norm && topicNameToIdMap[norm]) return topicNameToIdMap[norm];

        const matched = findMatchingTopic(trimmed, currentTopicsList);
        if (matched) {
          topicNameToIdMap[lower] = matched.id;
          if (norm) topicNameToIdMap[norm] = matched.id;
          return matched.id;
        }

        // Auto-create/sync new topic in database
        const targetSubjectName = subjects.find((s) => s.id === selectedSubject[0])?.name || "Subject";
        const { data: newTopic, error: createTopicErr } = await supabase
          .from("topics")
          .insert([{
            name: trimmed,
            class_id: selectedClass[0],
            subject_id: selectedSubject[0],
            description: `Course topic for ${targetSubjectName}`,
            order_index: nextTopicOrder++,
          }])
          .select("id, name")
          .single();

        if (createTopicErr || !newTopic) {
          throw new Error(`Failed to sync topic "${trimmed}": ${createTopicErr?.message || "Insert failed"}`);
        }

        newlyCreatedTopicsCount++;
        currentTopicsList.push({ id: newTopic.id, name: trimmed, order_index: nextTopicOrder });
        topicNameToIdMap[lower] = newTopic.id;
        if (norm) topicNameToIdMap[norm] = newTopic.id;
        return newTopic.id;
      };

      // Resolve topic ID for all items
      const itemResolvedTopicIds: string[] = [];
      for (const res of bulkParsedResources) {
        let tid: string;
        if (res.matchedTopicId && currentTopicsList.some((t) => t.id === res.matchedTopicId)) {
          tid = res.matchedTopicId;
        } else if (res.topicName?.trim()) {
          tid = await resolveAndSyncTopicId(res.topicName);
        } else if (selectedTopicId[0]) {
          tid = selectedTopicId[0];
        } else {
          tid = await resolveAndSyncTopicId("General Course Resources");
        }
        itemResolvedTopicIds.push(tid);

        // Auto-sync subtopic if present
        if (res.subTopicName?.trim()) {
          const subName = res.subTopicName.trim();
          if (!subtopicCache[tid]) {
            const { data: existingSubs } = await supabase
              .from("sub_topics")
              .select("name")
              .eq("topic_id", tid);
            subtopicCache[tid] = new Set(
              (existingSubs || []).map((s: any) => s.name.trim().toLowerCase())
            );
          }

          if (!subtopicCache[tid].has(subName.toLowerCase())) {
            const subPayload = {
              name: subName,
              description: `Subtopic for ${res.topicName || "topic"}`,
              topic_id: tid,
              class_id: selectedClass[0],
              subject_id: selectedSubject[0],
              order_index: 0,
            };
            const { error: subErr } = await supabase.from("sub_topics").insert([subPayload]);
            if (subErr) {
              await supabase.from("subtopics").insert([subPayload]);
            }
            subtopicCache[tid].add(subName.toLowerCase());
            newlyCreatedSubtopicsCount++;
          }
        }
      }

      // 2. Upload all accompanying files to Supabase and cache their public URLs
      const nameToUrlMap: Record<string, string> = {};
      for (const file of bulkResourceAttachedFiles) {
        const matchingRes = bulkParsedResources.find(
          (r) => r.fileName && r.fileName.toLowerCase() === file.name.toLowerCase()
        );
        const ext = file.name.split(".").pop()?.toLowerCase() || "";
        const uploadType = matchingRes?.type || (["mp4", "webm", "mov", "mkv"].includes(ext) ? "video" : "pdf");

        const publicUrl = await uploadFileToSupabase(file, uploadType);
        if (publicUrl) {
          nameToUrlMap[file.name.toLowerCase()] = publicUrl;
        }
      }

      // 3. Prepare database insert payloads
      const payloads = bulkParsedResources.map((item, idx) => {
        const topicId = itemResolvedTopicIds[idx];
        const desc = item.description?.trim()
          ? (item.subTopicName ? `${item.description.trim()} (Subtopic: ${item.subTopicName})` : item.description.trim())
          : (item.subTopicName ? `Subtopic: ${item.subTopicName}` : "");

        const resolvedUrl =
          (item.fileName && nameToUrlMap[item.fileName.toLowerCase()]) ||
          item.url ||
          "";

        return {
          class_id: selectedClass[0],
          subject_id: selectedSubject[0],
          topic_id: topicId,
          title: item.title.trim(),
          description: desc,
          type: item.type,
          duration: 0,
          order_index: idx,
          url: resolvedUrl,
        };
      });

      const { error } = await supabase.from("resources").insert(payloads);
      if (error) throw error;

      // 4. Refresh topics in CMS
      await fetchTopics(selectedClass[0], selectedSubject[0]);
      await fetchTopicModeTopics(selectedClass[0], selectedSubject[0]);

      const targetClassName = classes.find((c) => c.id === selectedClass[0])?.name || "Class";
      const targetSubjectName = subjects.find((s) => s.id === selectedSubject[0])?.name || "Subject";
      const distinctTopicsCount = new Set(itemResolvedTopicIds).size;

      setAlert({
        type: "success",
        message: `Successfully imported ${payloads.length} academic resource(s) across ${distinctTopicsCount} topic(s)${newlyCreatedTopicsCount > 0 ? ` (${newlyCreatedTopicsCount} new topic(s) synced to database)` : ""}${newlyCreatedSubtopicsCount > 0 ? ` with ${newlyCreatedSubtopicsCount} subtopic(s)` : ""} for ${targetClassName} — ${targetSubjectName}!`,
      });

      // Reset draft
      setBulkParsedResources([]);
      setBulkResourceAttachedFiles([]);
      setBulkResourceFileName(null);
      setBulkResourceText("");
      setBulkResourceImportError(null);
    } catch (err: any) {
      console.error("Bulk resource import failed:", err);
      setAlert({ type: "error", message: "Bulk Resource Import Error: " + err.message });
      setBulkResourceImportError(err.message);
    } finally {
      setBulkResourceImportLoading(false);
    }
  };

  // ── Quiz Question Handlers ──
  const updateQuestion = (i: number, f: keyof QuizQuestion, v: string) =>
    setQuestions((p) => p.map((q, j) => j === i ? { ...q, [f]: v } : q));

  const updateQuestionImage = (i: number, file: File | null) => {
    if (!file) {
      setQuestions((p) => p.map((q, j) => j === i ? { ...q, image_file: null, image_preview: null } : q));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setQuestions((p) => p.map((q, j) => j === i ? { ...q, image_file: file, image_preview: e.target?.result as string } : q));
    };
    reader.readAsDataURL(file);
  };

  const uploadQuestionImage = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `questions/${Math.random().toString(36).substring(2)}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("question-images").upload(path, file);
    if (error) { console.error("Image upload error:", error); return null; }
    const { data: { publicUrl } } = supabase.storage.from("question-images").getPublicUrl(path);
    return publicUrl;
  };

  const addQuestion = () => setQuestions((p) => [...p, emptyQuestion()]);
  const removeQuestion = (i: number) => { if (questions.length > 1) setQuestions((p) => p.filter((_, j) => j !== i)); };
  const isQuestionValid = (q: QuizQuestion) =>
    q.question_text.trim() && q.option_a.trim() && q.option_b.trim() && q.option_c.trim() && q.option_d.trim() && q.correct_option;

  const createOrGetQuiz = async (): Promise<string | null> => {
    // 1. If a quiz container already exists for this topic, use it
    if (quizzes.length > 0 && quizzes[0].id) {
      return quizzes[0].id;
    }

    // 2. Create quiz container for this topic
    try {
      const selectedTopicObj = quizTopics.find((t) => t.id === quizSelectedTopic[0]);
      const topicTitle = selectedTopicObj ? selectedTopicObj.name : "Topic Quiz";

      const { data, error } = await supabase
        .from("quizzes")
        .insert({
          class_id: quizSelectedClass[0],
          subject_id: quizSelectedSubject[0],
          topic_id: quizSelectedTopic[0],
          title: topicTitle,
        })
        .select("id")
        .single();

      if (!error && data) {
        await fetchQuizzes(quizSelectedClass[0], quizSelectedSubject[0], quizSelectedTopic[0]);
        return data.id;
      }

      if (error) {
        setAlert({ type: "error", message: "Failed to initialize quiz container: " + error.message });
        return null;
      }

      return null;
    } catch (err: any) {
      setAlert({ type: "error", message: "Error establishing quiz container: " + err.message });
      return null;
    }
  };

  // Helper to test if a string is a valid UUID
  const isValidUUID = (id: string | null | undefined): boolean => {
    if (!id || typeof id !== "string") return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id.trim());
  };

  // Safe helper to extract and trim string values from any type (objects, values, primitives)
  const safeNormalizeString = (val: any): string | null => {
    if (val === null || val === undefined) return null;
    if (typeof val === "string") {
      const trimmed = val.trim();
      return trimmed.length > 0 ? trimmed : null;
    }
    if (typeof val === "number") {
      return String(val);
    }
    if (typeof val === "object" && val !== null) {
      if (typeof val.value === "string") return safeNormalizeString(val.value);
      if (typeof val.id === "string") return safeNormalizeString(val.id);
      if (typeof val.name === "string") return safeNormalizeString(val.name);
    }
    const str = String(val).trim();
    return str.length > 0 && str !== "[object Object]" ? str : null;
  };

  // Helper to resolve subtopic names or IDs to valid database subtopic UUIDs
  // If a subtopic name from CSV or input doesn't exist in the database, it creates it automatically!
  const resolveSubtopicMap = async (
    classId: string,
    subjectId: string,
    topicId: string,
    namesOrIds: any[]
  ): Promise<{ map: Map<string, string>; fallbackSubtopicId: string | null }> => {
    const map = new Map<string, string>(); // lowercase name or id -> db UUID
    let fallbackSubtopicId: string | null = null;

    try {
      // 1. Fetch current subtopics for this topic from DB
      let currentSubtopics: { id: string; name: string }[] = [];
      const { data: dbSubtopics } = await supabase
        .from("sub_topics")
        .select("id, name")
        .eq("topic_id", topicId)
        .order("order_index", { ascending: true })
        .order("name", { ascending: true });

      if (dbSubtopics && dbSubtopics.length > 0) {
        currentSubtopics = dbSubtopics as { id: string; name: string }[];
      } else {
        // Try fallback table name 'subtopics'
        const { data: altSubtopics } = await supabase
          .from("subtopics")
          .select("id, name")
          .eq("topic_id", topicId);
        if (altSubtopics && altSubtopics.length > 0) {
          currentSubtopics = altSubtopics as { id: string; name: string }[];
        }
      }

      // Merge in any subtopics from component state
      quizSubTopics.forEach((st) => {
        if (st && st.id && !currentSubtopics.some((c) => c.id === st.id)) {
          currentSubtopics.push({ id: st.id, name: st.name });
        }
      });

      // Populate lookup map with all known subtopics
      currentSubtopics.forEach((st) => {
        const idStr = safeNormalizeString(st?.id);
        const nameStr = safeNormalizeString(st?.name);
        if (idStr) {
          map.set(idStr.toLowerCase(), idStr);
          map.set(idStr, idStr);
          if (!fallbackSubtopicId) fallbackSubtopicId = idStr;
        }
        if (nameStr && idStr) {
          map.set(nameStr.toLowerCase(), idStr);
          map.set(nameStr.trim().toLowerCase(), idStr);
        }
      });

      // 2. Identify missing subtopic names that need to be created in the database
      const missingNames: string[] = [];
      namesOrIds.forEach((item) => {
        const normalized = safeNormalizeString(item);
        if (!normalized) return;
        if (isValidUUID(normalized)) {
          map.set(normalized.toLowerCase(), normalized);
          map.set(normalized, normalized);
          if (!fallbackSubtopicId) fallbackSubtopicId = normalized;
          return;
        }
        const lowerNorm = normalized.toLowerCase();
        if (map.has(lowerNorm)) return;

        // Try fuzzy/partial match on existing subtopics
        const matched = currentSubtopics.find(
          (st) => st.name && (st.name.toLowerCase().includes(lowerNorm) || lowerNorm.includes(st.name.toLowerCase()))
        );
        if (matched && matched.id) {
          map.set(lowerNorm, matched.id);
          if (!fallbackSubtopicId) fallbackSubtopicId = matched.id;
          return;
        }

        missingNames.push(normalized);
      });

      const uniqueMissing = Array.from(new Set(missingNames));

      // 3. Auto-create any missing subtopic names into sub_topics table
      if (uniqueMissing.length > 0) {
        const newRecords = uniqueMissing.map((name, idx) => ({
          name,
          description: "Created via question upload",
          topic_id: topicId,
          class_id: classId,
          subject_id: subjectId,
          order_index: currentSubtopics.length + idx,
        }));

        const { data: inserted, error: insertErr } = await supabase
          .from("sub_topics")
          .insert(newRecords)
          .select("id, name");

        if (!insertErr && inserted) {
          inserted.forEach((st: any) => {
            const idStr = safeNormalizeString(st?.id);
            const nameStr = safeNormalizeString(st?.name);
            if (idStr) {
              map.set(idStr.toLowerCase(), idStr);
              map.set(idStr, idStr);
              if (!fallbackSubtopicId) fallbackSubtopicId = idStr;
            }
            if (nameStr && idStr) {
              map.set(nameStr.toLowerCase(), idStr);
              map.set(nameStr.trim().toLowerCase(), idStr);
            }
          });
          // Refresh quizSubTopics dropdown in CMS
          await fetchQuizSubTopics(topicId);
        }
      }

      // 4. If no subtopics existed at all for this topic, create a default "General" subtopic
      if (!fallbackSubtopicId && currentSubtopics.length === 0) {
        const selectedTopicObj = quizTopics.find((t) => t.id === topicId);
        const defaultName = selectedTopicObj?.name ? `${selectedTopicObj.name} - General` : "General";
        const { data: defaultSub, error: defErr } = await supabase
          .from("sub_topics")
          .insert({
            name: defaultName,
            description: "Default subtopic for questions",
            topic_id: topicId,
            class_id: classId,
            subject_id: subjectId,
            order_index: 0,
          })
          .select("id, name")
          .single();

        if (!defErr && defaultSub) {
          const idStr = safeNormalizeString(defaultSub.id);
          if (idStr) {
            fallbackSubtopicId = idStr;
            map.set(idStr.toLowerCase(), idStr);
            map.set(idStr, idStr);
            if (defaultSub.name) {
              map.set(defaultSub.name.toLowerCase(), idStr);
            }
            await fetchQuizSubTopics(topicId);
          }
        }
      }
    } catch (err) {
      console.warn("Subtopic resolution notice:", err);
    }

    return { map, fallbackSubtopicId };
  };

  const handleQuizUpload = async () => {
    if (!quizSelectedClass[0] || !quizSelectedSubject[0] || !quizSelectedTopic[0]) {
      setAlert({ type: "error", message: "Please ensure Class, Subject, and Topic parameters are selected." }); return;
    }
    if (!quizSelectedSubtopics[0]) {
      setAlert({ type: "error", message: "Please select a Subtopic for these quiz questions." }); return;
    }
    if (questions.some((q) => !isQuestionValid(q))) {
      setAlert({ type: "error", message: "Please fill in all required question text, choices (A-D), and correct answer keys." }); return;
    }
    setQuizLoading(true);
    try {
      const quizId = await createOrGetQuiz();
      if (!quizId) { setQuizLoading(false); return; }

      // Gather subtopic candidates from questions and selected dropdown
      const subtopicCandidates = [
        ...(Array.isArray(quizSelectedSubtopics) ? quizSelectedSubtopics : []),
        ...questions.map((q) => q.subtopic_id || q.subtopic_name),
      ];

      const { map: subtopicMap, fallbackSubtopicId } = await resolveSubtopicMap(
        quizSelectedClass[0],
        quizSelectedSubject[0],
        quizSelectedTopic[0],
        subtopicCandidates
      );

      const rawDefaultSub = safeNormalizeString(quizSelectedSubtopics?.[0]);
      const defaultSubtopicId = rawDefaultSub
        ? (subtopicMap.get(rawDefaultSub.toLowerCase()) || subtopicMap.get(rawDefaultSub) || (isValidUUID(rawDefaultSub) ? rawDefaultSub : fallbackSubtopicId))
        : fallbackSubtopicId;

      const rows = await Promise.all(
        questions.map(async (q) => {
          let image_url: string | null = null;
          if (q.image_file) image_url = await uploadQuestionImage(q.image_file);
          
          const rawQSub = safeNormalizeString(q.subtopic_id || q.subtopic_name);
          let finalSubtopicId: string | null = null;
          if (rawQSub) {
            finalSubtopicId = subtopicMap.get(rawQSub.toLowerCase()) || subtopicMap.get(rawQSub) || (isValidUUID(rawQSub) ? rawQSub : null);
          }
          if (!finalSubtopicId) {
            finalSubtopicId = defaultSubtopicId || fallbackSubtopicId;
          }

          if (!finalSubtopicId) {
            throw new Error("Could not resolve a valid Subtopic UUID. Please ensure a subtopic is selected.");
          }

          const rowData: Record<string, any> = {
            question_text: q.question_text.trim(),
            option_a: q.option_a.trim(),
            option_b: q.option_b.trim(),
            option_c: q.option_c.trim(),
            option_d: q.option_d.trim(),
            correct_option: q.correct_option,
            answer_explanation: q.answer_explanation?.trim() || null,
            image_url,
            subject_id: quizSelectedSubject[0],
            topic_id: quizSelectedTopic[0],
            quiz_id: quizId,
            subtopic_id: finalSubtopicId,
          };

          return rowData;
        })
      );

      // Direct insert into questions table
      const { error } = await supabase.from("questions").insert(rows);
      if (error) throw error;

      setAlert({ type: "success", message: `${rows.length} manual questions loaded into your database!` });
      setQuestions([emptyQuestion()]);
      await fetchQuizzes(quizSelectedClass[0], quizSelectedSubject[0], quizSelectedTopic[0]);
    } catch (err) {
      setAlert({ type: "error", message: "Upload failed: " + (err as Error).message });
    } finally { setQuizLoading(false); }
  };

  // ── CSV Parsing ──
  const REQUIRED_HEADERS = ["question_text", "option_a", "option_b", "option_c", "option_d", "correct_option"];
  const parseImportFile = (file: File) => {
    setImportError(null); setImportedQuestions([]); setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(ws, { defval: "" });
        if (!rows.length) { setImportError("File contains no row lines."); return; }
        
        // Find missing headers with case-insensitive check
        const firstRowKeys = Object.keys(rows[0]).map((k) => k.trim().toLowerCase());
        const missing = REQUIRED_HEADERS.filter((h) => !firstRowKeys.includes(h.toLowerCase()));
        if (missing.length) { setImportError(`Missing columns: ${missing.join(", ")}. Use the template.`); return; }
        
        const parsed: QuizQuestion[] = []; const errs: string[] = [];
        
        // Lookup helpers for subtopics
        const subtopicMapByName = new Map<string, SubTopic>();
        const subtopicMapById = new Map<string, SubTopic>();
        quizSubTopics.forEach((st) => {
          subtopicMapByName.set(st.name.trim().toLowerCase(), st);
          subtopicMapById.set(st.id, st);
        });

        rows.forEach((rawRow, i) => {
          // Normalize row keys to lowercase
          const row: Record<string, any> = {};
          Object.keys(rawRow).forEach((k) => {
            row[k.trim().toLowerCase()] = rawRow[k];
          });

          const co = String(row.correct_option || "").toLowerCase().trim();
          if (!["a", "b", "c", "d"].includes(co)) { errs.push(`Row ${i + 2}: correct_option must be a–d`); return; }
          if (!row.question_text?.toString().trim()) { errs.push(`Row ${i + 2}: question_text is empty`); return; }
          
          const rawSubtopic = String(row.subtopic_name || row.subtopic || row.sub_topic || row.subtopic_id || "").trim();
          let matchedSubtopic: SubTopic | undefined = undefined;

          if (rawSubtopic) {
            matchedSubtopic = subtopicMapById.get(rawSubtopic) || subtopicMapByName.get(rawSubtopic.toLowerCase());
            if (!matchedSubtopic) {
              matchedSubtopic = quizSubTopics.find((st) =>
                st.name.toLowerCase().includes(rawSubtopic.toLowerCase()) ||
                rawSubtopic.toLowerCase().includes(st.name.toLowerCase())
              );
            }
          }

          let resolvedSubtopicId: string | null = matchedSubtopic ? matchedSubtopic.id : null;
          let resolvedSubtopicName: string = matchedSubtopic ? matchedSubtopic.name : rawSubtopic;

          // If no specific subtopic specified in CSV row, but 1 subtopic is selected in dropdown, default to it
          if (!resolvedSubtopicId && quizSelectedSubtopics.length === 1) {
            const singleSelected = quizSubTopics.find((s) => s.id === quizSelectedSubtopics[0]);
            if (singleSelected) {
              resolvedSubtopicId = singleSelected.id;
              resolvedSubtopicName = singleSelected.name;
            }
          }

          const explanation = String(row.answer_explanation || row.explanation || row.explanation_to_answer || row.solution || "").trim();
          const imgName = String(row.image_file_name || row.image_name || row.image || "").trim();

          parsed.push({
            question_text: String(row.question_text).trim(),
            option_a: String(row.option_a).trim(),
            option_b: String(row.option_b).trim(),
            option_c: String(row.option_c).trim(),
            option_d: String(row.option_d).trim(),
            correct_option: co as any,
            answer_explanation: explanation,
            subtopic_id: resolvedSubtopicId,
            subtopic_name: resolvedSubtopicName,
            csv_image_name: imgName,
          });
        });

        if (errs.length) { setImportError(errs.slice(0, 3).join(" · ")); return; }
        setImportedQuestions(parsed);
      } catch { setImportError("Could not parse spreadsheet accurately."); }
    };
    reader.readAsArrayBuffer(file);
  };

  const downloadCsvTemplate = () => {
    const headers = [
      "question_text",
      "option_a",
      "option_b",
      "option_c",
      "option_d",
      "correct_option",
      "subtopic_name",
      "answer_explanation",
      "image_file_name",
    ];

    // Determine sample subtopics based on current selection or all topic subtopics
    const selectedSubObjs = quizSubTopics.filter((s) => quizSelectedSubtopics.includes(s.id));
    const activeSubList = selectedSubObjs.length > 0 ? selectedSubObjs : quizSubTopics;
    
    const subName1 = activeSubList[0]?.name || "Sample Subtopic A";
    const subName2 = activeSubList[1]?.name || subName1;

    const examples = [
      [
        "What is the derivative of sin(x)?",
        "cos(x)",
        "-cos(x)",
        "tan(x)",
        "sec(x)",
        "A",
        subName1,
        "By differentiation rules, d/dx [sin(x)] = cos(x).",
        "diagram_1.png",
      ],
      [
        "Which law states that for every action, there is an equal and opposite reaction?",
        "Newton's First Law",
        "Newton's Second Law",
        "Newton's Third Law",
        "Law of Universal Gravitation",
        "C",
        subName2,
        "Newton's third law of motion explains action-reaction force pairs.",
        "",
      ],
    ];

    const csvRows = [
      headers.join(","),
      ...examples.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quiz_questions_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileImportUpload = async () => {
    if (!quizSelectedClass[0] || !quizSelectedSubject[0] || !quizSelectedTopic[0]) {
      setAlert({ type: "error", message: "Ensure all parameters align." }); return;
    }
    setQuizLoading(true);
    try {
      const quizId = await createOrGetQuiz();
      if (!quizId) { setQuizLoading(false); return; }

      const nameToUrlMap: Record<string, string> = {};
      for (const imgFile of bulkImageFiles) {
        const publicUrl = await uploadQuestionImage(imgFile);
        if (publicUrl) nameToUrlMap[imgFile.name] = publicUrl;
      }

      // Gather subtopic candidates across all imported questions and dropdown
      const subtopicCandidates = [
        ...(Array.isArray(quizSelectedSubtopics) ? quizSelectedSubtopics : []),
        ...importedQuestions.map((q) => q.subtopic_name || q.subtopic_id),
      ];

      const { map: subtopicMap, fallbackSubtopicId } = await resolveSubtopicMap(
        quizSelectedClass[0],
        quizSelectedSubject[0],
        quizSelectedTopic[0],
        subtopicCandidates
      );

      const rawDefaultSub = safeNormalizeString(quizSelectedSubtopics?.[0]);
      const defaultSubtopicId = rawDefaultSub
        ? (subtopicMap.get(rawDefaultSub.toLowerCase()) || subtopicMap.get(rawDefaultSub) || (isValidUUID(rawDefaultSub) ? rawDefaultSub : fallbackSubtopicId))
        : fallbackSubtopicId;

      const rows = importedQuestions.map((q) => {
        let matchedUrl = null;
        if (q.csv_image_name && nameToUrlMap[q.csv_image_name]) matchedUrl = nameToUrlMap[q.csv_image_name];

        const rawSubtopic = safeNormalizeString(q.subtopic_name || q.subtopic_id);
        let finalSubtopicId: string | null = null;
        if (rawSubtopic) {
          finalSubtopicId = subtopicMap.get(rawSubtopic.toLowerCase()) || subtopicMap.get(rawSubtopic) || (isValidUUID(rawSubtopic) ? rawSubtopic : null);
        }
        if (!finalSubtopicId) {
          finalSubtopicId = defaultSubtopicId || fallbackSubtopicId;
        }

        if (!finalSubtopicId) {
          throw new Error("Could not resolve a valid Subtopic UUID for imported questions. Please ensure a subtopic is selected.");
        }

        const rowData: Record<string, any> = {
          question_text: q.question_text.trim(),
          option_a: q.option_a.trim(),
          option_b: q.option_b.trim(),
          option_c: q.option_c.trim(),
          option_d: q.option_d.trim(),
          correct_option: q.correct_option,
          answer_explanation: q.answer_explanation || null,
          image_url: matchedUrl,
          subject_id: quizSelectedSubject[0],
          topic_id: quizSelectedTopic[0],
          quiz_id: quizId,
          subtopic_id: finalSubtopicId,
        };

        return rowData;
      });

      // Direct insert into questions table
      const { error } = await supabase.from("questions").insert(rows);
      if (error) throw error;

      setAlert({ type: "success", message: `${rows.length} CSV questions processed successfully with subtopics!` });
      setImportedQuestions([]); setImportFileName(null); setBulkImageFiles([]);
      await fetchQuizzes(quizSelectedClass[0], quizSelectedSubject[0], quizSelectedTopic[0]);
    } catch (err) {
      setAlert({ type: "error", message: "Upload failed: " + (err as Error).message });
    } finally { setQuizLoading(false); }
  };

  // ── Memoized Collections for Chakra UI v3 ──
  const classCollection = useMemo(() => createListCollection<SelectItem>({ items: classes.map((c) => ({ label: c.name, value: c.id })) }), [classes]);
  const subjectCollection = useMemo(() => createListCollection<SelectItem>({ items: subjects.map((s) => ({ label: s.name, value: s.id })) }), [subjects]);
  const fileTypeCollection = useMemo(() => createListCollection<SelectItem>({ items: [{ label: "PDF", value: "pdf" }, { label: "Video", value: "video" }, { label: "Past Questions", value: "pqs" }] }), []);
  const correctOptionCollection = useMemo(() => createListCollection<SelectItem>({ items: [{ label: "Option A", value: "A" }, { label: "Option B", value: "B" }, { label: "Option C", value: "C" }, { label: "Option D", value: "D" }] }), []);

  // Fixed mapping hooks targeting live reactive lists flawlessly
  const topicCollection = useMemo(() => createListCollection<SelectItem>({ items: topics.map((t) => ({ label: t.name, value: t.id })) }), [topics]);
  const existingTopicCollection = useMemo(() => createListCollection<SelectItem>({ items: topicModeTopics.map((t) => ({ label: t.name, value: t.id })) }), [topicModeTopics]);
  const quizTopicCollection = useMemo(() => createListCollection<SelectItem>({ items: quizTopics.map((t) => ({ label: t.name, value: t.id })) }), [quizTopics]);
  const quizSubTopicCollection = useMemo(() => createListCollection<SelectItem>({ items: quizSubTopics.map((st) => ({ label: st.name + (st.description || st.desc ? ` — ${st.description || st.desc}` : ""), value: st.id })) }), [quizSubTopics]);
  const subTopicCollection = useMemo(() => createListCollection<SelectItem>({ items: resourceSubTopics.map((st) => ({ label: st.name + (st.description || st.desc ? ` — ${st.description || st.desc}` : ""), value: st.id })) }), [resourceSubTopics]);

  const isMultipleSubtopicsSelected = quizSelectedSubtopics.length > 1;
  const quizUploadDisabled =
    !quizSelectedClass[0] ||
    !quizSelectedSubject[0] ||
    !quizSelectedTopic[0] ||
    !quizSelectedSubtopics[0] ||
    isMultipleSubtopicsSelected ||
    questions.some((q) => !isQuestionValid(q)) ||
    quizLoading;

  return (
    <Box minH="100vh" bg="gray.50" backgroundImage="radial-gradient(circle, #e2e8f0 1px, transparent 1px)" backgroundSize="22px 22px" p={{ base: 4, md: 8 }} position="relative">
      <Box position="fixed" top="-15%" left="-8%" w="500px" h="500px" borderRadius="full" bg="blue.100" opacity={0.4} filter="blur(100px)" pointerEvents="none" zIndex={0} />

      {alert && (
        <Box position="fixed" top={5} right={5} w={{ base: "90vw", sm: "340px" }} zIndex={50} style={{ animation: "slideIn 0.22s" }}>
          <Alert.Root status={alert.type} variant="subtle" borderRadius="xl" boxShadow="0 8px 30px rgba(0,0,0,0.12)">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title fontSize="sm">{alert.type === "error" ? "Error" : "Success"}</Alert.Title>
              <Alert.Description fontSize="xs">{alert.message}</Alert.Description>
            </Alert.Content>
          </Alert.Root>
        </Box>
      )}

      <Box position="relative" zIndex={1} maxW="1360px" mx="auto">
      
              {/* ─── MODERN PAGE HEADER WITH BACK BUTTON ─── */}
              <Box mb={8}>
                <HStack justify="space-between" align="center" flexWrap="wrap" gap={4} width="100%">
                  <HStack gap={3} align="center">
                    <Box w="4px" h={9} bg="blue.500" borderRadius="full" flexShrink={0} />
                    <Box>
                      <Heading fontSize={{ base: "2xl", md: "28px" }} fontWeight="800" color="gray.900" letterSpacing="-0.025em" lineHeight="1">
                        Content Management Dashboard
                      </Heading>
                      <Text fontSize="sm" color="gray.600" mt={1.5} fontWeight="500">
                        Manage active subject subtopics, files, and complete dynamic quiz uploads.
                      </Text>
                    </Box>
                  </HStack>
      
                  <Button
                    variant="outline"
                    size="sm"
                    borderRadius="full"
                    borderColor="gray.200"
                    bg="white"
                    color="gray.600"
                    px={4}
                    h={9}
                    fontSize="13px"
                    fontWeight="500"
                    _hover={{ bg: "gray.50", borderColor: "gray.300", color: "gray.800" }}
                    transition="all 0.15s"
                    onClick={() => {
                      window.location.href = "/admin/dashboard";
                    }}
                  >
                    ← Back to Dashboard
                  </Button>
                </HStack>
              </Box>

        <Grid templateColumns={{ base: "1fr", xl: "1fr 1fr" }} gap={6} alignItems="start">
          
          {/* ══ LEFT COLUMN ══ */}
          <VStack gap={6} align="stretch">
            
            {/* 1. Add New Topic & Subtopic Management */}
            <SectionCard icon={MdPlaylistAdd} title="Create Course Topic" subtitle="Add topics and manage subtopics in the database" accentColor="blue.500">
              <VStack gap={4} align="stretch">
                {/* Tabs to switch between creating a new topic, adding subtopics to an existing topic, or bulk import */}
                <HStack p={1} bg="gray.100" borderRadius="xl" gap={1}>
                  <Button
                    size="xs"
                    flex={1}
                    borderRadius="lg"
                    fontSize="xs"
                    fontWeight="600"
                    variant={topicCreationTab === "new_topic" ? "solid" : "ghost"}
                    bg={topicCreationTab === "new_topic" ? "white" : "transparent"}
                    color={topicCreationTab === "new_topic" ? "blue.600" : "gray.600"}
                    boxShadow={topicCreationTab === "new_topic" ? "0 1px 3px rgba(0,0,0,0.08)" : "none"}
                    onClick={() => setTopicCreationTab("new_topic")}
                  >
                    ＋ New Topic
                  </Button>
                  <Button
                    size="xs"
                    flex={1}
                    borderRadius="lg"
                    fontSize="xs"
                    fontWeight="600"
                    variant={topicCreationTab === "existing_topic" ? "solid" : "ghost"}
                    bg={topicCreationTab === "existing_topic" ? "white" : "transparent"}
                    color={topicCreationTab === "existing_topic" ? "blue.600" : "gray.600"}
                    boxShadow={topicCreationTab === "existing_topic" ? "0 1px 3px rgba(0,0,0,0.08)" : "none"}
                    onClick={() => setTopicCreationTab("existing_topic")}
                  >
                    Add Subtopics
                  </Button>
                  <Button
                    size="xs"
                    flex={1}
                    borderRadius="lg"
                    fontSize="xs"
                    fontWeight="600"
                    variant={topicCreationTab === "bulk_import" ? "solid" : "ghost"}
                    bg={topicCreationTab === "bulk_import" ? "white" : "transparent"}
                    color={topicCreationTab === "bulk_import" ? "blue.600" : "gray.600"}
                    boxShadow={topicCreationTab === "bulk_import" ? "0 1px 3px rgba(0,0,0,0.08)" : "none"}
                    onClick={() => setTopicCreationTab("bulk_import")}
                  >
                    📥 Bulk Import
                  </Button>
                </HStack>

                {topicCreationTab === "new_topic" ? (
                  <>
                    <Grid templateColumns="1fr 1fr" gap={3}>
                      <StyledSelect collection={classCollection} value={topicClass} onValueChange={(e) => setTopicClass(e.value)} label="Target Class" placeholder="Select class" />
                      <StyledSelect collection={subjectCollection} value={topicSubject} onValueChange={(e) => setTopicSubject(e.value)} label="Target Subject" placeholder="Select subject" />
                    </Grid>

                    <Box>
                      <Text {...fieldLabelProps}>New Topic Name</Text>
                      <Input placeholder="e.g. Logarithms, Photosynthesis" value={newTopicName} onChange={(e) => setNewTopicName(e.target.value)} bg="gray.50" border="1px solid" borderColor="gray.200" borderRadius="lg" fontSize="sm" h={10} />
                    </Box>

                    <Box>
                      <Text {...fieldLabelProps}>Topic Description (Optional)</Text>
                      <Textarea placeholder="Brief summary overview..." value={newTopicDescription} onChange={(e) => setNewTopicDescription(e.target.value)} rows={2} bg="gray.50" border="1px solid" borderColor="gray.200" borderRadius="lg" fontSize="sm" resize="none" />
                    </Box>

                    {/* Subtopics input rows */}
                    <Box border="1px solid" borderColor="gray.200" borderRadius="xl" p={3.5} bg="gray.50">
                      <HStack justify="space-between" align="center" mb={2.5}>
                        <Box>
                          <Text fontSize="xs" fontWeight="700" color="gray.700" textTransform="uppercase" letterSpacing="0.05em">
                            Subtopics (Optional)
                          </Text>
                          <Text fontSize="11px" color="gray.500">
                            Add subtopic breakdown entries under this topic
                          </Text>
                        </Box>
                        <Button
                          size="xs"
                          variant="outline"
                          borderColor="blue.300"
                          color="blue.600"
                          bg="white"
                          borderRadius="md"
                          onClick={addSubTopicRow}
                        >
                          <Icon as={FiPlus} mr={1} /> Add Subtopic
                        </Button>
                      </HStack>

                      <VStack gap={2} align="stretch">
                        {subTopicsList.map((st, idx) => (
                          <HStack key={st.id || idx} gap={2} align="center">
                            <Input
                              placeholder={`Subtopic ${idx + 1} Name`}
                              value={st.name}
                              onChange={(e) => updateSubTopicRow(idx, "name", e.target.value)}
                              bg="white"
                              border="1px solid"
                              borderColor="gray.200"
                              borderRadius="md"
                              fontSize="xs"
                              h={8}
                              flex={1.2}
                            />
                            <Input
                              placeholder="Description (Optional)"
                              value={st.desc}
                              onChange={(e) => updateSubTopicRow(idx, "desc", e.target.value)}
                              bg="white"
                              border="1px solid"
                              borderColor="gray.200"
                              borderRadius="md"
                              fontSize="xs"
                              h={8}
                              flex={1.5}
                            />
                            <IconButton
                              aria-label="Remove subtopic"
                              size="xs"
                              variant="ghost"
                              color="gray.400"
                              _hover={{ color: "red.500", bg: "red.50" }}
                              onClick={() => removeSubTopicRow(idx)}
                            >
                              <Icon as={FiTrash2} boxSize={3.5} />
                            </IconButton>
                          </HStack>
                        ))}
                      </VStack>
                    </Box>

                    <Button bg="blue.500" color="white" rounded="xl" h={10} fontSize="sm" fontWeight="600" onClick={handleCreateTopic} loading={topicLoading} disabled={!topicClass[0] || !topicSubject[0] || !newTopicName.trim()}>
                      Add New Topic {subTopicsList.some(s => s.name.trim()) ? "& Subtopics" : ""}
                    </Button>
                  </>
                ) : topicCreationTab === "existing_topic" ? (
                  <>
                    <Grid templateColumns="1fr 1fr" gap={3}>
                      <StyledSelect collection={classCollection} value={topicClass} onValueChange={(e) => setTopicClass(e.value)} label="Target Class" placeholder="Select class" />
                      <StyledSelect collection={subjectCollection} value={topicSubject} onValueChange={(e) => setTopicSubject(e.value)} label="Target Subject" placeholder="Select subject" />
                    </Grid>

                    <StyledSelect 
                      collection={existingTopicCollection} 
                      value={existingTopicId} 
                      onValueChange={(e) => setExistingTopicId(e.value)} 
                      label="Select Course Topic" 
                      placeholder={
                        !topicClass[0] || !topicSubject[0] 
                          ? "Select class & subject first" 
                          : topicModeTopics.length === 0 
                          ? "No topics found for this subject & class" 
                          : "Choose topic to add subtopics to..."
                      } 
                      disabled={!topicClass[0] || !topicSubject[0] || topicModeTopics.length === 0} 
                    />

                    {/* Display existing subtopics for the selected topic */}
                    {existingTopicId[0] && (
                      <Box bg="blue.50/40" border="1px solid" borderColor="blue.100" borderRadius="xl" p={3}>
                        <HStack justify="space-between" mb={2}>
                          <Text fontSize="xs" fontWeight="700" color="blue.800" textTransform="uppercase" letterSpacing="0.04em">
                            Current Topic Subtopics ({existingTopicCurrentSubTopics.length})
                          </Text>
                          <Badge colorPalette="blue" size="sm" variant="subtle" fontSize="10px">
                            {existingTopicCurrentSubTopics.length} Active
                          </Badge>
                        </HStack>
                        {existingTopicCurrentSubTopics.length === 0 ? (
                          <Text fontSize="xs" color="gray.500" fontStyle="italic">
                            No subtopics created for this topic yet. Add your first subtopics below!
                          </Text>
                        ) : (
                          <HStack wrap="wrap" gap={1.5}>
                            {existingTopicCurrentSubTopics.map((st) => (
                              <Badge 
                                key={st.id}
                                colorPalette="blue" 
                                variant="surface" 
                                px={2.5} 
                                py={1} 
                                borderRadius="md" 
                                fontSize="xs"
                                fontWeight="500"
                              >
                                {st.name}
                              </Badge>
                            ))}
                          </HStack>
                        )}
                      </Box>
                    )}

                    {/* Subtopics for existing topic */}
                    <Box border="1px solid" borderColor="gray.200" borderRadius="xl" p={3.5} bg="gray.50">
                      <HStack justify="space-between" align="center" mb={2.5}>
                        <Box>
                          <Text fontSize="xs" fontWeight="700" color="gray.700" textTransform="uppercase" letterSpacing="0.05em">
                            Subtopics to Add
                          </Text>
                          <Text fontSize="11px" color="gray.500">
                            Enter subtopic titles to insert into sub_topics table
                          </Text>
                        </Box>
                        <Button
                          size="xs"
                          variant="outline"
                          borderColor="blue.300"
                          color="blue.600"
                          bg="white"
                          borderRadius="md"
                          onClick={addExistingSubTopicRow}
                        >
                          <Icon as={FiPlus} mr={1} /> Add Subtopic
                        </Button>
                      </HStack>

                      <VStack gap={2} align="stretch">
                        {existingTopicSubList.map((st, idx) => (
                          <HStack key={st.id || idx} gap={2} align="center">
                            <Input
                              placeholder={`Subtopic ${idx + 1} Name`}
                              value={st.name}
                              onChange={(e) => updateExistingSubTopicRow(idx, "name", e.target.value)}
                              bg="white"
                              border="1px solid"
                              borderColor="gray.200"
                              borderRadius="md"
                              fontSize="xs"
                              h={8}
                              flex={1.2}
                            />
                            <Input
                              placeholder="Description (Optional)"
                              value={st.desc}
                              onChange={(e) => updateExistingSubTopicRow(idx, "desc", e.target.value)}
                              bg="white"
                              border="1px solid"
                              borderColor="gray.200"
                              borderRadius="md"
                              fontSize="xs"
                              h={8}
                              flex={1.5}
                            />
                            <IconButton
                              aria-label="Remove subtopic"
                              size="xs"
                              variant="ghost"
                              color="gray.400"
                              _hover={{ color: "red.500", bg: "red.50" }}
                              onClick={() => removeExistingSubTopicRow(idx)}
                            >
                              <Icon as={FiTrash2} boxSize={3.5} />
                            </IconButton>
                          </HStack>
                        ))}
                      </VStack>
                    </Box>

                    <Button 
                      bg="blue.500" 
                      color="white" 
                      rounded="xl" 
                      h={10} 
                      fontSize="sm" 
                      fontWeight="600" 
                      onClick={handleAddSubTopicsToExistingTopic} 
                      loading={existingSubLoading} 
                      disabled={!topicClass[0] || !topicSubject[0] || !existingTopicId[0] || !existingTopicSubList.some(s => s.name.trim())}
                    >
                      Save Subtopics to Topic
                    </Button>
                  </>
                ) : (
                  <>
                    {/* ── Bulk Import Topics & Subtopics Section ── */}
                    <Grid templateColumns="1fr 1fr" gap={3}>
                      <StyledSelect
                        collection={classCollection}
                        value={topicClass}
                        onValueChange={(e) => setTopicClass(e.value)}
                        label="Target Class"
                        placeholder="Select class"
                      />
                      <StyledSelect
                        collection={subjectCollection}
                        value={topicSubject}
                        onValueChange={(e) => setTopicSubject(e.value)}
                        label="Target Subject"
                        placeholder="Select subject"
                      />
                    </Grid>

                    {(!topicClass[0] || !topicSubject[0]) && (
                      <Box bg="amber.50" border="1px solid" borderColor="amber.200" borderRadius="lg" p={2.5} fontSize="xs" color="amber.800">
                        💡 Please select the Target Class and Target Subject above to organize your imported curriculum topics.
                      </Box>
                    )}

                    {/* Sub-mode selector */}
                    <HStack p={1} bg="gray.100" borderRadius="lg" gap={1}>
                      <Button
                        size="xs"
                        flex={1}
                        borderRadius="md"
                        fontSize="xs"
                        fontWeight="600"
                        variant={bulkTopicMode === "file" ? "solid" : "ghost"}
                        bg={bulkTopicMode === "file" ? "white" : "transparent"}
                        color={bulkTopicMode === "file" ? "blue.600" : "gray.600"}
                        boxShadow={bulkTopicMode === "file" ? "0 1px 2px rgba(0,0,0,0.06)" : "none"}
                        onClick={() => setBulkTopicMode("file")}
                      >
                        📁 Upload Spreadsheet (.xlsx / .csv)
                      </Button>
                      <Button
                        size="xs"
                        flex={1}
                        borderRadius="md"
                        fontSize="xs"
                        fontWeight="600"
                        variant={bulkTopicMode === "paste" ? "solid" : "ghost"}
                        bg={bulkTopicMode === "paste" ? "white" : "transparent"}
                        color={bulkTopicMode === "paste" ? "blue.600" : "gray.600"}
                        boxShadow={bulkTopicMode === "paste" ? "0 1px 2px rgba(0,0,0,0.06)" : "none"}
                        onClick={() => setBulkTopicMode("paste")}
                      >
                        📝 Paste Syllabus Outline
                      </Button>
                    </HStack>

                    {/* File Upload Mode */}
                    {bulkTopicMode === "file" && (
                      <VStack align="stretch" gap={3}>
                        <label
                          htmlFor="bulk-topic-file-input"
                          style={{
                            display: "block",
                            padding: "20px 16px",
                            border: "2px dashed #CBD5E0",
                            borderRadius: "12px",
                            textAlign: "center",
                            cursor: "pointer",
                            background: "#F8FAFC",
                            transition: "all 0.2s",
                          }}
                        >
                          <input
                            id="bulk-topic-file-input"
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            style={{ display: "none" }}
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) parseTopicSpreadsheetFile(f);
                              e.target.value = "";
                            }}
                          />
                          <VStack gap={1.5} align="center">
                            <Icon as={IoCloudUploadOutline} boxSize={7} color="blue.500" />
                            <Text fontSize="xs" fontWeight="600" color="gray.700">
                              {bulkImportFileName ? `Selected File: ${bulkImportFileName}` : "Click or drag spreadsheet file (.xlsx, .xls, .csv)"}
                            </Text>
                            <Text fontSize="11px" color="gray.500">
                              Columns: topic_name, topic_description, subtopic_name, subtopic_description
                            </Text>
                          </VStack>
                        </label>

                        {/* Download sample templates */}
                        <HStack justify="space-between" flexWrap="wrap" gap={2}>
                          <HStack gap={1.5}>
                            <Button
                              size="xs"
                              variant="outline"
                              borderColor="gray.300"
                              color="gray.700"
                              bg="white"
                              borderRadius="md"
                              onClick={() => downloadTopicTemplate("xlsx")}
                            >
                              <Icon as={FiDownload} mr={1} /> Download .xlsx Template
                            </Button>
                            <Button
                              size="xs"
                              variant="outline"
                              borderColor="gray.300"
                              color="gray.700"
                              bg="white"
                              borderRadius="md"
                              onClick={() => downloadTopicTemplate("csv")}
                            >
                              <Icon as={FiDownload} mr={1} /> Download .csv Template
                            </Button>
                          </HStack>

                          {bulkImportFileName && (
                            <Button
                              size="xs"
                              variant="ghost"
                              color="red.500"
                              _hover={{ bg: "red.50" }}
                              onClick={() => {
                                setBulkImportFileName(null);
                                setBulkParsedTopics([]);
                                setBulkImportError(null);
                              }}
                            >
                              <Icon as={FiX} mr={1} /> Clear File
                            </Button>
                          )}
                        </HStack>
                      </VStack>
                    )}

                    {/* Paste Outline Mode */}
                    {bulkTopicMode === "paste" && (
                      <VStack align="stretch" gap={2}>
                        <HStack justify="space-between" align="center">
                          <Text {...fieldLabelProps}>Syllabus Outline Text</Text>
                          <HStack gap={1.5}>
                            <Button
                              size="xs"
                              variant="outline"
                              borderColor="blue.300"
                              color="blue.600"
                              bg="white"
                              borderRadius="md"
                              onClick={() => {
                                setBulkImportText(SAMPLE_TOPIC_OUTLINE);
                                parseTopicOutlineText(SAMPLE_TOPIC_OUTLINE);
                              }}
                            >
                              Load Sample Outline
                            </Button>
                            {bulkImportText && (
                              <Button
                                size="xs"
                                variant="ghost"
                                color="gray.500"
                                onClick={() => {
                                  setBulkImportText("");
                                  setBulkParsedTopics([]);
                                  setBulkImportError(null);
                                }}
                              >
                                Clear
                              </Button>
                            )}
                          </HStack>
                        </HStack>

                        <Textarea
                          placeholder={`Topic: Algebraic Processes\nDescription: Linear and quadratic equations\n- Simultaneous Linear Equations: Elimination and substitution\n- Quadratic Equations: Factoring and formula method\n\nTopic: Plane Geometry\n- Circle Theorems: Angles subtended by arcs`}
                          value={bulkImportText}
                          onChange={(e) => {
                            setBulkImportText(e.target.value);
                            parseTopicOutlineText(e.target.value);
                          }}
                          rows={6}
                          bg="gray.50"
                          border="1px solid"
                          borderColor="gray.200"
                          borderRadius="lg"
                          fontSize="xs"
                          fontFamily="monospace"
                        />
                        <Text fontSize="11px" color="gray.500">
                          Format: `Topic: Topic Name`, optional `Description: ...`, followed by bulleted subtopics (`- Subtopic: Description` or `• Subtopic Name`).
                        </Text>
                      </VStack>
                    )}

                    {/* Error Notice */}
                    {bulkImportError && (
                      <Box bg="red.50" border="1px solid" borderColor="red.200" borderRadius="lg" p={2.5} fontSize="xs" color="red.700">
                        <HStack gap={1.5}>
                          <Icon as={FiAlertCircle} boxSize={4} color="red.500" />
                          <Text>{bulkImportError}</Text>
                        </HStack>
                      </Box>
                    )}

                    {/* Parsed Topics Preview */}
                    {bulkParsedTopics.length > 0 && (
                      <Box border="1px solid" borderColor="blue.100" borderRadius="xl" p={3.5} bg="blue.50/30">
                        <HStack justify="space-between" align="center" mb={2.5} flexWrap="wrap" gap={2}>
                          <HStack gap={2}>
                            <Text fontSize="xs" fontWeight="700" color="gray.700" textTransform="uppercase" letterSpacing="0.04em">
                              Parsed Topics & Subtopics
                            </Text>
                            <Badge colorPalette="blue" size="sm" variant="surface">
                              {bulkParsedTopics.length} Topics
                            </Badge>
                            <Badge colorPalette="purple" size="sm" variant="surface">
                              {totalBulkSubtopicsCount} Subtopics
                            </Badge>
                          </HStack>

                          {topicClass[0] && topicSubject[0] && (
                            <Badge colorPalette="teal" size="sm" variant="subtle">
                              Target: {classes.find(c => c.id === topicClass[0])?.name || "Class"} — {subjects.find(s => s.id === topicSubject[0])?.name || "Subject"}
                            </Badge>
                          )}
                        </HStack>

                        <VStack gap={2} align="stretch" maxH="280px" overflowY="auto" pr={1}>
                          {bulkParsedTopics.map((topicItem, tIdx) => {
                            const existingMatch = topicModeTopics.find(
                              (t) => t.name.trim().toLowerCase() === topicItem.topicName.trim().toLowerCase()
                            );
                            return (
                              <Box
                                key={tIdx}
                                bg="white"
                                border="1px solid"
                                borderColor={existingMatch ? "orange.200" : "gray.200"}
                                borderRadius="lg"
                                p={2.5}
                                boxShadow="0 1px 2px rgba(0,0,0,0.04)"
                              >
                                <HStack justify="space-between" align="flex-start">
                                  <VStack align="flex-start" gap={0.5} flex={1}>
                                    <HStack gap={1.5} flexWrap="wrap">
                                      <Badge colorPalette="gray" size="xs">#{tIdx + 1}</Badge>
                                      <Text fontSize="xs" fontWeight="700" color="gray.800">
                                        {topicItem.topicName}
                                      </Text>
                                      {existingMatch ? (
                                        <Badge colorPalette="orange" size="xs" variant="subtle">
                                          ⚡ Existing in DB (Will append new subtopics)
                                        </Badge>
                                      ) : (
                                        <Badge colorPalette="green" size="xs" variant="subtle">
                                          ✨ New Topic
                                        </Badge>
                                      )}
                                      <Badge colorPalette="blue" size="xs" variant="outline">
                                        {topicItem.subtopics.length} subtopic{topicItem.subtopics.length !== 1 ? "s" : ""}
                                      </Badge>
                                    </HStack>
                                    {topicItem.topicDescription && (
                                      <Text fontSize="11px" color="gray.500" fontStyle="italic">
                                        {topicItem.topicDescription}
                                      </Text>
                                    )}
                                  </VStack>

                                  <IconButton
                                    aria-label="Remove topic from import"
                                    size="xs"
                                    variant="ghost"
                                    color="gray.400"
                                    _hover={{ color: "red.500", bg: "red.50" }}
                                    onClick={() => removeBulkParsedTopic(tIdx)}
                                  >
                                    <Icon as={FiTrash2} boxSize={3.5} />
                                  </IconButton>
                                </HStack>

                                {/* Subtopics list */}
                                {topicItem.subtopics.length > 0 ? (
                                  <VStack align="stretch" gap={1} mt={2} pt={1.5} borderTop="1px solid" borderColor="gray.100">
                                    {topicItem.subtopics.map((sub, sIdx) => (
                                      <HStack
                                        key={sIdx}
                                        bg="gray.50"
                                        px={2}
                                        py={1}
                                        borderRadius="md"
                                        justify="space-between"
                                        align="center"
                                      >
                                        <Text fontSize="11px" fontWeight="600" color="gray.700">
                                          • {sub.name}
                                        </Text>
                                        {sub.description && (
                                          <Text fontSize="10px" color="gray.500" maxW="50%" isTruncated>
                                            {sub.description}
                                          </Text>
                                        )}
                                      </HStack>
                                    ))}
                                  </VStack>
                                ) : (
                                  <Text fontSize="10px" color="gray.400" fontStyle="italic" mt={1}>
                                    No subtopics defined (Topic only)
                                  </Text>
                                )}
                              </Box>
                            );
                          })}
                        </VStack>
                      </Box>
                    )}

                    {/* Import Execute Button */}
                    <Button
                      bg="blue.500"
                      color="white"
                      rounded="xl"
                      h={10}
                      fontSize="sm"
                      fontWeight="600"
                      onClick={handleExecuteBulkImport}
                      loading={bulkImportLoading}
                      disabled={
                        !topicClass[0] ||
                        !topicSubject[0] ||
                        bulkParsedTopics.length === 0 ||
                        bulkImportLoading
                      }
                    >
                      {bulkParsedTopics.length > 0
                        ? `Import ${bulkParsedTopics.length} Topic${bulkParsedTopics.length !== 1 ? "s" : ""} & ${totalBulkSubtopicsCount} Subtopic${totalBulkSubtopicsCount !== 1 ? "s" : ""}`
                        : "Import Topics & Subtopics"}
                    </Button>
                  </>
                )}
              </VStack>
            </SectionCard>

            {/* 2. Academic Resources */}
            <SectionCard icon={HiOutlineDocumentArrowUp} title="Academic Resources" subtitle="PDFs, videos, past questions & bulk asset imports" accentColor="blue.500">
              <VStack gap={4} align="stretch">
                {/* Mode Selector Tabs */}
                <HStack bg="gray.100" p={1} borderRadius="xl" gap={1}>
                  <Button
                    size="xs"
                    flex={1}
                    borderRadius="lg"
                    fontSize="xs"
                    fontWeight="600"
                    variant={resourceActiveTab === "single" ? "solid" : "ghost"}
                    bg={resourceActiveTab === "single" ? "white" : "transparent"}
                    color={resourceActiveTab === "single" ? "blue.600" : "gray.600"}
                    boxShadow={resourceActiveTab === "single" ? "0 1px 3px rgba(0,0,0,0.08)" : "none"}
                    onClick={() => setResourceActiveTab("single")}
                  >
                    ＋ Single Resource
                  </Button>
                  <Button
                    size="xs"
                    flex={1}
                    borderRadius="lg"
                    fontSize="xs"
                    fontWeight="600"
                    variant={resourceActiveTab === "batch_files" ? "solid" : "ghost"}
                    bg={resourceActiveTab === "batch_files" ? "white" : "transparent"}
                    color={resourceActiveTab === "batch_files" ? "blue.600" : "gray.600"}
                    boxShadow={resourceActiveTab === "batch_files" ? "0 1px 3px rgba(0,0,0,0.08)" : "none"}
                    onClick={() => setResourceActiveTab("batch_files")}
                  >
                    📂 Batch Files ({batchResourceFiles.length})
                  </Button>
                  <Button
                    size="xs"
                    flex={1}
                    borderRadius="lg"
                    fontSize="xs"
                    fontWeight="600"
                    variant={resourceActiveTab === "spreadsheet" ? "solid" : "ghost"}
                    bg={resourceActiveTab === "spreadsheet" ? "white" : "transparent"}
                    color={resourceActiveTab === "spreadsheet" ? "blue.600" : "gray.600"}
                    boxShadow={resourceActiveTab === "spreadsheet" ? "0 1px 3px rgba(0,0,0,0.08)" : "none"}
                    onClick={() => setResourceActiveTab("spreadsheet")}
                  >
                    📥 Spreadsheet Import
                  </Button>
                </HStack>

                {/* ── TAB 1: Single Resource Upload ── */}
                {resourceActiveTab === "single" && (
                  <>
                    <Grid templateColumns="1fr 1fr" gap={3}>
                      <StyledSelect collection={classCollection} value={selectedClass} onValueChange={(e) => setSelectedClass(e.value)} label="Class Filter" placeholder="Select class" />
                      <StyledSelect collection={subjectCollection} value={selectedSubject} onValueChange={(e) => setSelectedSubject(e.value)} label="Subject Filter" placeholder="Select subject" />
                    </Grid>

                    {/* Course Topic Selector */}
                    <StyledSelect 
                      collection={topicCollection} value={selectedTopicId} onValueChange={(e) => setSelectedTopicId(e.value)} 
                      label="Select Course Topic" 
                      placeholder={!selectedClass[0] || !selectedSubject[0] ? "Select class & subject first" : topics.length === 0 ? "No topics found matching selections" : "Choose topic..."} 
                      disabled={!selectedClass[0] || !selectedSubject[0] || topics.length === 0} 
                    />

                    {/* Subtopic Filter Select */}
                    <StyledSelect 
                      collection={subTopicCollection} 
                      value={selectedSubTopicId} 
                      onValueChange={(e) => setSelectedSubTopicId(e.value)} 
                      label="Subtopic Filter (Optional)" 
                      placeholder={
                        !selectedClass[0] || !selectedSubject[0] 
                          ? "Select class & subject first" 
                          : !selectedTopicId[0] 
                          ? "Select topic first" 
                          : resourceSubTopics.length === 0 
                          ? "No subtopics found for this topic (Optional)" 
                          : "Select subtopic (Optional)..."
                      } 
                      disabled={!selectedTopicId[0] || resourceSubTopics.length === 0} 
                    />

                    <StyledSelect collection={fileTypeCollection} value={fileType} onValueChange={(e) => setFileType(e.value)} label="File Type" placeholder="Select type" />

                    <Box>
                      <Text {...fieldLabelProps}>Description</Text>
                      <Textarea placeholder="Summary logs (optional)" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} bg="gray.50" border="1px solid" borderColor="gray.200" borderRadius="lg" fontSize="sm" resize="none" />
                    </Box>

                    <Box>
                      <Text {...fieldLabelProps}>Upload Resource Asset File</Text>
                      <Box {...getRootProps()} border="2px dashed" borderColor={isDragActive ? "blue.400" : "gray.200"} borderRadius="xl" p={5} textAlign="center" cursor="pointer" bg={isDragActive ? "blue.50" : "gray.50"}>
                        <input {...getInputProps()} />
                        <VStack gap={1.5}>
                          <Icon as={IoCloudUploadOutline} boxSize={5} color="blue.500" />
                          <Text fontSize="xs" color="gray.600" fontWeight="500">{isDragActive ? "Drop here" : "Browse or drop academic file item here"}</Text>
                        </VStack>
                      </Box>
                    </Box>

                    {files.map((file, i) => (
                      <HStack key={i} p={3} bg="blue.50" borderRadius="xl" justify="space-between">
                        <HStack gap={2}><Icon as={FiFile} color="blue.600" /><Text fontSize="xs" fontWeight="600" truncate maxW="180px">{file.name}</Text></HStack>
                        <IconButton aria-label="Remove" size="xs" variant="ghost" onClick={() => removeFile(i)}><Icon as={FiX} /></IconButton>
                      </HStack>
                    ))}

                    <Button bg="blue.500" color="white" rounded="xl" h={11} onClick={handleUploadResource} disabled={!files.length || !selectedTopicId[0] || loading} loading={loading}>
                      Upload Resource Item
                    </Button>
                  </>
                )}

                {/* ── TAB 2: Batch Multi-File Upload ── */}
                {resourceActiveTab === "batch_files" && (
                  <>
                    <Grid templateColumns="1fr 1fr" gap={3}>
                      <StyledSelect collection={classCollection} value={selectedClass} onValueChange={(e) => setSelectedClass(e.value)} label="Target Class" placeholder="Select class" />
                      <StyledSelect collection={subjectCollection} value={selectedSubject} onValueChange={(e) => setSelectedSubject(e.value)} label="Target Subject" placeholder="Select subject" />
                    </Grid>

                    {/* Default Topic and Subtopic for batch assignment */}
                    <Grid templateColumns="1.2fr 1fr" gap={3}>
                      <StyledSelect 
                        collection={topicCollection} 
                        value={selectedTopicId} 
                        onValueChange={(e) => setSelectedTopicId(e.value)} 
                        label="Default Course Topic" 
                        placeholder={!selectedClass[0] || !selectedSubject[0] ? "Select class & subject first" : topics.length === 0 ? "No topics found" : "Assign to topic..."} 
                        disabled={!selectedClass[0] || !selectedSubject[0] || topics.length === 0} 
                      />
                      <StyledSelect 
                        collection={subTopicCollection} 
                        value={selectedSubTopicId} 
                        onValueChange={(e) => setSelectedSubTopicId(e.value)} 
                        label="Subtopic (Optional)" 
                        placeholder={!selectedTopicId[0] ? "Topic first" : resourceSubTopics.length === 0 ? "None" : "Select subtopic..."} 
                        disabled={!selectedTopicId[0] || resourceSubTopics.length === 0} 
                      />
                    </Grid>

                    {batchResourceFiles.length > 0 && selectedTopicId[0] && (
                      <Button
                        size="xs"
                        variant="subtle"
                        colorPalette="blue"
                        alignSelf="flex-start"
                        borderRadius="md"
                        fontSize="11px"
                        onClick={() => applyTopicToAllBatchFiles(selectedTopicId[0], selectedSubTopicId[0] || "")}
                      >
                        <Icon as={FiCheck} mr={1} /> Apply Selected Topic & Subtopic to All ({batchResourceFiles.length}) Files
                      </Button>
                    )}

                    {/* Batch Multi-File Dropzone */}
                    <Box>
                      <Text {...fieldLabelProps}>Select or Drop Multiple Academic Files</Text>
                      <Box
                        {...getBatchRootProps()}
                        border="2px dashed"
                        borderColor={isBatchDragActive ? "blue.400" : "blue.200"}
                        borderRadius="xl"
                        p={5}
                        textAlign="center"
                        cursor="pointer"
                        bg={isBatchDragActive ? "blue.50" : "blue.50/30"}
                        _hover={{ borderColor: "blue.400", bg: "blue.50/50" }}
                        transition="all 0.15s"
                      >
                        <input {...getBatchInputProps()} />
                        <VStack gap={1.5}>
                          <Icon as={IoCloudUploadOutline} boxSize={7} color="blue.500" />
                          <Text fontSize="xs" color="gray.800" fontWeight="600">
                            {isBatchDragActive ? "Drop multiple files here..." : "Click or drag & drop multiple files at once"}
                          </Text>
                          <Text fontSize="11px" color="gray.500">
                            Supports PDF documents, MP4/WebM videos, and past question compilations.
                          </Text>
                        </VStack>
                      </Box>
                    </Box>

                    {/* Queued Files List */}
                    {batchResourceFiles.length > 0 && (
                      <Box bg="gray.50" border="1px solid" borderColor="gray.200" borderRadius="xl" p={3}>
                        <HStack justify="space-between" mb={2}>
                          <HStack gap={2}>
                            <Text fontSize="xs" fontWeight="700" color="gray.800" textTransform="uppercase" letterSpacing="0.04em">
                              Queued Files ({batchResourceFiles.length})
                            </Text>
                            <Badge colorPalette="blue" size="sm" variant="subtle">
                              {batchResourceFiles.filter(f => f.status === "done").length} / {batchResourceFiles.length} Uploaded
                            </Badge>
                          </HStack>
                          <Button
                            size="xs"
                            variant="ghost"
                            color="gray.400"
                            _hover={{ color: "red.500" }}
                            onClick={() => setBatchResourceFiles([])}
                            disabled={batchUploading}
                          >
                            Clear All
                          </Button>
                        </HStack>

                        <VStack align="stretch" gap={2} maxH="320px" overflowY="auto" pr={1}>
                          {batchResourceFiles.map((item, idx) => {
                            const assignedTopic = topics.find(t => t.id === (item.topicId || selectedTopicId[0]));
                            return (
                              <Box
                                key={item.id}
                                bg="white"
                                border="1px solid"
                                borderColor={item.status === "error" ? "red.200" : item.status === "done" ? "green.200" : "gray.200"}
                                borderRadius="lg"
                                p={2.5}
                                boxShadow="0 1px 2px rgba(0,0,0,0.02)"
                              >
                                <HStack justify="space-between" align="center" mb={1.5}>
                                  <HStack gap={2} flex={1} overflow="hidden">
                                    <Icon
                                      as={item.type === "video" ? MdVideoLibrary : MdPictureAsPdf}
                                      boxSize={4}
                                      color={item.type === "video" ? "purple.500" : "blue.500"}
                                    />
                                    <Text fontSize="xs" fontWeight="600" color="gray.700" isTruncated maxW="220px">
                                      {item.name}
                                    </Text>
                                    <Text fontSize="10px" color="gray.400">
                                      ({(item.file.size / 1024 / 1024).toFixed(2)} MB)
                                    </Text>
                                  </HStack>

                                  <HStack gap={1.5}>
                                    {/* Type Pill Selector */}
                                    <HStack bg="gray.100" p={0.5} borderRadius="md" gap={0.5}>
                                      {(["pdf", "video", "pqs"] as const).map((t) => (
                                        <Button
                                          key={t}
                                          size="2xs"
                                          variant="ghost"
                                          bg={item.type === t ? "white" : "transparent"}
                                          color={item.type === t ? "blue.600" : "gray.500"}
                                          fontSize="9px"
                                          fontWeight="700"
                                          textTransform="uppercase"
                                          px={1.5}
                                          h={4}
                                          borderRadius="sm"
                                          onClick={() => updateBatchFile(idx, "type", t)}
                                        >
                                          {t}
                                        </Button>
                                      ))}
                                    </HStack>

                                    {/* Status Badge */}
                                    {item.status === "done" && (
                                      <Badge colorPalette="green" size="sm" variant="subtle" fontSize="9px">
                                        <Icon as={FiCheckCircle} mr={0.5} /> Done
                                      </Badge>
                                    )}
                                    {item.status === "uploading" && (
                                      <Badge colorPalette="blue" size="sm" variant="surface" fontSize="9px">
                                        Uploading...
                                      </Badge>
                                    )}
                                    {item.status === "error" && (
                                      <Badge colorPalette="red" size="sm" variant="subtle" fontSize="9px">
                                        Error
                                      </Badge>
                                    )}

                                    <IconButton
                                      aria-label="Remove"
                                      size="xs"
                                      variant="ghost"
                                      color="gray.400"
                                      _hover={{ color: "red.500" }}
                                      onClick={() => removeBatchFile(idx)}
                                      disabled={batchUploading}
                                    >
                                      <Icon as={FiTrash2} boxSize={3} />
                                    </IconButton>
                                  </HStack>
                                </HStack>

                                {/* Editable Title */}
                                <Input
                                  size="xs"
                                  placeholder="Resource Display Title"
                                  value={item.title}
                                  onChange={(e) => updateBatchFile(idx, "title", e.target.value)}
                                  fontSize="xs"
                                  borderRadius="md"
                                  bg="gray.50"
                                  border="1px solid"
                                  borderColor="gray.200"
                                  h={7}
                                  mb={1.5}
                                />

                                <HStack justify="space-between" fontSize="10px" color="gray.500">
                                  <Text>
                                    Topic: <Text as="span" fontWeight="600" color={assignedTopic ? "blue.600" : "red.500"}>
                                      {assignedTopic ? assignedTopic.name : "Select Default Topic Above"}
                                    </Text>
                                  </Text>
                                  {item.errorMsg && (
                                    <Text color="red.500" fontSize="10px" fontWeight="500">
                                      {item.errorMsg}
                                    </Text>
                                  )}
                                </HStack>
                              </Box>
                            );
                          })}
                        </VStack>
                      </Box>
                    )}

                    {/* Batch Upload Action Button */}
                    <Button
                      bg="blue.500"
                      color="white"
                      rounded="xl"
                      h={11}
                      onClick={handleUploadBatchFiles}
                      disabled={
                        !selectedClass[0] ||
                        !selectedSubject[0] ||
                        batchResourceFiles.length === 0 ||
                        batchResourceFiles.every(f => f.status === "done") ||
                        batchUploading
                      }
                      loading={batchUploading}
                    >
                      {batchResourceFiles.length > 0
                        ? `Upload All (${batchResourceFiles.filter(f => f.status !== "done").length}) Queued Resource File(s)`
                        : "Upload Queued Resources"}
                    </Button>
                  </>
                )}

                {/* ── TAB 3: Spreadsheet / Links Bulk Import ── */}
                {resourceActiveTab === "spreadsheet" && (
                  <>
                    <Grid templateColumns="1fr 1fr" gap={3}>
                      <StyledSelect collection={classCollection} value={selectedClass} onValueChange={(e) => setSelectedClass(e.value)} label="Target Class" placeholder="Select class" />
                      <StyledSelect collection={subjectCollection} value={selectedSubject} onValueChange={(e) => setSelectedSubject(e.value)} label="Target Subject" placeholder="Select subject" />
                    </Grid>

                    {/* Fallback Course Topic Selector */}
                    <StyledSelect 
                      collection={topicCollection} 
                      value={selectedTopicId} 
                      onValueChange={(e) => setSelectedTopicId(e.value)} 
                      label="Fallback Course Topic (Optional — Topics in CSV sync automatically)" 
                      placeholder={!selectedClass[0] || !selectedSubject[0] ? "Select class & subject first" : topics.length === 0 ? "No existing topics (CSV topics will auto-create)" : "Select fallback topic (optional)..."} 
                      disabled={!selectedClass[0] || !selectedSubject[0] || topics.length === 0} 
                    />

                    {/* Format Toggle: Upload File vs Paste Links/Outline */}
                    <HStack bg="gray.100" p={1} borderRadius="lg" gap={1}>
                      <Button
                        size="xs"
                        flex={1}
                        borderRadius="md"
                        fontSize="xs"
                        fontWeight="600"
                        variant={bulkResourceMode === "file" ? "solid" : "ghost"}
                        bg={bulkResourceMode === "file" ? "white" : "transparent"}
                        color={bulkResourceMode === "file" ? "blue.600" : "gray.600"}
                        onClick={() => setBulkResourceMode("file")}
                      >
                        📄 Spreadsheet File (.xlsx, .csv)
                      </Button>
                      <Button
                        size="xs"
                        flex={1}
                        borderRadius="md"
                        fontSize="xs"
                        fontWeight="600"
                        variant={bulkResourceMode === "paste" ? "solid" : "ghost"}
                        bg={bulkResourceMode === "paste" ? "white" : "transparent"}
                        color={bulkResourceMode === "paste" ? "blue.600" : "gray.600"}
                        onClick={() => setBulkResourceMode("paste")}
                      >
                        📝 Paste Outline
                      </Button>
                    </HStack>

                    {/* Step 1: Upload Spreadsheet or Paste Outline */}
                    <Box>
                      <Text {...fieldLabelProps}>Step 1: Upload CSV/Excel Sheet or Outline</Text>
                      {bulkResourceMode === "file" ? (
                        <VStack align="stretch" gap={2}>
                          <label
                            htmlFor="bulk-resource-file-input"
                            style={{
                              border: "2px dashed #CBD5E1",
                              borderRadius: "12px",
                              padding: "16px",
                              textAlign: "center",
                              cursor: "pointer",
                              background: "#F8FAFC",
                              display: "block",
                            }}
                          >
                            <input
                              id="bulk-resource-file-input"
                              type="file"
                              accept=".xlsx,.xls,.csv"
                              style={{ display: "none" }}
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) parseResourceSpreadsheetFile(f);
                                e.target.value = "";
                              }}
                            />
                            <VStack gap={1.5} align="center">
                              <Icon as={IoCloudUploadOutline} boxSize={6} color="blue.500" />
                              <Text fontSize="xs" fontWeight="600" color="gray.700">
                                {bulkResourceFileName ? `Selected: ${bulkResourceFileName}` : "Click to select spreadsheet (.xlsx, .xls, .csv)"}
                              </Text>
                              <Text fontSize="11px" color="gray.500">
                                Columns: title, type, file_name, topic_name, subtopic_name, description
                              </Text>
                            </VStack>
                          </label>

                          {/* Download sample templates */}
                          <HStack justify="space-between" flexWrap="wrap" gap={2}>
                            <HStack gap={1.5}>
                              <Button
                                size="xs"
                                variant="outline"
                                fontSize="11px"
                                h={7}
                                borderRadius="md"
                                onClick={() => downloadResourceTemplate("xlsx")}
                              >
                                <Icon as={FiDownload} mr={1} /> Excel Template (.xlsx)
                              </Button>
                              <Button
                                size="xs"
                                variant="outline"
                                fontSize="11px"
                                h={7}
                                borderRadius="md"
                                onClick={() => downloadResourceTemplate("csv")}
                              >
                                <Icon as={FiDownload} mr={1} /> CSV Template (.csv)
                              </Button>
                            </HStack>
                            {bulkResourceFileName && (
                              <Button
                                size="xs"
                                variant="ghost"
                                color="red.500"
                                fontSize="11px"
                                h={7}
                                onClick={() => {
                                  setBulkResourceFileName(null);
                                  setBulkParsedResources([]);
                                  setBulkResourceImportError(null);
                                }}
                              >
                                Clear Sheet
                              </Button>
                            )}
                          </HStack>
                        </VStack>
                      ) : (
                        <VStack align="stretch" gap={2}>
                          <HStack justify="space-between" align="center">
                            <Text fontSize="11px" color="gray.500">Separated by Tab, Pipe | or Comma</Text>
                            <Button
                              size="2xs"
                              variant="subtle"
                              colorPalette="blue"
                              fontSize="10px"
                              borderRadius="md"
                              onClick={() => {
                                setBulkResourceText(SAMPLE_RESOURCE_PASTE);
                                parseResourceOutlineText(SAMPLE_RESOURCE_PASTE);
                              }}
                            >
                              Load Sample Data
                            </Button>
                          </HStack>

                          <Textarea
                            placeholder="Title | Type (pdf/video/pqs) | File Name | Topic | Subtopic | Description"
                            value={bulkResourceText}
                            onChange={(e) => {
                              setBulkResourceText(e.target.value);
                              parseResourceOutlineText(e.target.value);
                            }}
                            rows={4}
                            bg="gray.50"
                            border="1px solid"
                            borderColor="gray.200"
                            borderRadius="lg"
                            fontSize="xs"
                            fontFamily="monospace"
                          />
                        </VStack>
                      )}
                    </Box>

                    {/* Step 2: Upload Accompanying Resource Files */}
                    <Box>
                      <Text {...fieldLabelProps}>Step 2: Upload Accompanying Resource Files</Text>
                      <label
                        htmlFor="resource-bulk-assets-node"
                        style={{
                          display: "block",
                          padding: "16px",
                          border: "2px dashed #CBD5E1",
                          borderRadius: "12px",
                          textAlign: "center",
                          cursor: "pointer",
                          background: "#F8FAFC",
                        }}
                      >
                        <input
                          id="resource-bulk-assets-node"
                          type="file"
                          multiple
                          accept=".pdf,.mp4,.webm,.mov,.mkv,.avi,.doc,.docx,.zip,.pqs"
                          style={{ display: "none" }}
                          onChange={(e) => {
                            if (e.target.files) {
                              const files = Array.from(e.target.files);
                              setBulkResourceAttachedFiles((prev) => {
                                const map = new Map(prev.map((f) => [f.name, f]));
                                files.forEach((f) => map.set(f.name, f));
                                return Array.from(map.values());
                              });
                              e.target.value = "";
                            }
                          }}
                        />
                        <VStack gap={1} align="center">
                          <Icon as={FiUpload} boxSize={5} color="blue.500" mb={0.5} />
                          <Text fontSize="xs" fontWeight="600" color="gray.700">
                            Select or drop all files referenced under the <Text as="span" color="blue.600" fontFamily="monospace">file_name / name</Text> column
                          </Text>
                          <Text fontSize="11px" color="gray.500">
                            PDF study notes, video tutorials (.mp4, .webm), and past exam questions
                          </Text>
                        </VStack>
                      </label>
                      {bulkResourceAttachedFiles.length > 0 && (
                        <HStack justify="space-between" mt={2} align="center" bg="blue.50" px={3} py={1.5} borderRadius="lg">
                          <Badge colorPalette="blue" variant="subtle" fontSize="11px">
                            📁 {bulkResourceAttachedFiles.length} file{bulkResourceAttachedFiles.length !== 1 ? "s" : ""} cross-referenced
                          </Badge>
                          <Button
                            size="2xs"
                            variant="ghost"
                            color="red.500"
                            fontSize="10px"
                            h={5}
                            onClick={() => setBulkResourceAttachedFiles([])}
                          >
                            Clear Files
                          </Button>
                        </HStack>
                      )}
                    </Box>

                    {/* Error Notice */}
                    {bulkResourceImportError && (
                      <Alert.Root status="error" borderRadius="xl">
                        <Alert.Indicator />
                        <Alert.Content>
                          <Alert.Title fontSize="xs">Parse Issue</Alert.Title>
                          <Alert.Description fontSize="xs">{bulkResourceImportError}</Alert.Description>
                        </Alert.Content>
                      </Alert.Root>
                    )}

                    {/* Parsed Resources Preview */}
                    {bulkParsedResources.length > 0 && (
                      <Box bg="gray.50" border="1px solid" borderColor="gray.200" borderRadius="xl" p={3}>
                        <HStack justify="space-between" mb={2}>
                          <HStack gap={2} wrap="wrap">
                            <Text fontSize="xs" fontWeight="700" color="gray.800" textTransform="uppercase" letterSpacing="0.04em">
                              Parsed Resources ({bulkParsedResources.length})
                            </Text>
                            {(() => {
                              const matchedCount = bulkParsedResources.filter(
                                (r) => r.fileName && bulkResourceAttachedFiles.some(
                                  (f) => f.name.toLowerCase() === r.fileName.toLowerCase()
                                )
                              ).length;
                              const totalWithFile = bulkParsedResources.filter((r) => r.fileName).length;
                              return totalWithFile > 0 ? (
                                <Badge
                                  colorPalette={matchedCount === totalWithFile ? "green" : "orange"}
                                  size="sm"
                                  variant="subtle"
                                  fontSize="10px"
                                >
                                  {matchedCount}/{totalWithFile} Files Matched
                                </Badge>
                              ) : null;
                            })()}
                            {(() => {
                              const uniqueTopics = Array.from(new Set(bulkParsedResources.map(r => r.topicName.trim()).filter(Boolean)));
                              const newTopicsCount = bulkParsedResources.filter(r => r.isNewTopic && r.topicName.trim()).reduce((acc, r) => acc.add(r.topicName.trim().toLowerCase()), new Set<string>()).size;
                              return (
                                <HStack gap={1} wrap="wrap">
                                  {uniqueTopics.length > 0 && (
                                    <Badge colorPalette="cyan" size="sm" variant="subtle" fontSize="10px">
                                      📚 {uniqueTopics.length} Topic{uniqueTopics.length !== 1 ? "s" : ""}
                                    </Badge>
                                  )}
                                  {newTopicsCount > 0 && (
                                    <Badge colorPalette="purple" size="sm" variant="subtle" fontSize="10px">
                                      ✨ {newTopicsCount} New to Sync
                                    </Badge>
                                  )}
                                </HStack>
                              );
                            })()}
                            <HStack gap={1}>
                              <Badge colorPalette="blue" size="sm" variant="subtle" fontSize="10px">
                                {bulkParsedResources.filter(r => r.type === "pdf").length} PDFs
                              </Badge>
                              <Badge colorPalette="purple" size="sm" variant="subtle" fontSize="10px">
                                {bulkParsedResources.filter(r => r.type === "video").length} Videos
                              </Badge>
                              <Badge colorPalette="teal" size="sm" variant="subtle" fontSize="10px">
                                {bulkParsedResources.filter(r => r.type === "pqs").length} PQs
                              </Badge>
                            </HStack>
                          </HStack>
                          <Button
                            size="xs"
                            variant="ghost"
                            color="gray.400"
                            _hover={{ color: "red.500" }}
                            onClick={() => {
                              setBulkParsedResources([]);
                              setBulkResourceFileName(null);
                              setBulkResourceText("");
                            }}
                          >
                            Clear
                          </Button>
                        </HStack>

                        {/* List of parsed resources */}
                        <VStack align="stretch" gap={2} maxH="320px" overflowY="auto" pr={1}>
                          {bulkParsedResources.map((item, idx) => {
                            const effectiveTopicId = item.matchedTopicId || selectedTopicId[0];
                            const effectiveTopicObj = topics.find(t => t.id === effectiveTopicId);
                            const isFileMatched = item.fileName
                              ? bulkResourceAttachedFiles.some(
                                  (f) => f.name.toLowerCase() === item.fileName.toLowerCase()
                                )
                              : false;

                            return (
                              <Box
                                key={item.id}
                                bg="white"
                                border="1px solid"
                                borderColor={item.fileName && !isFileMatched ? "orange.200" : "gray.200"}
                                borderRadius="lg"
                                p={2.5}
                                boxShadow="0 1px 2px rgba(0,0,0,0.02)"
                              >
                                <HStack justify="space-between" align="flex-start">
                                  <VStack align="start" gap={1} flex={1} overflow="hidden">
                                    <HStack gap={1.5} wrap="wrap">
                                      <Badge
                                        colorPalette={item.type === "video" ? "purple" : item.type === "pqs" ? "teal" : "blue"}
                                        size="xs"
                                        variant="solid"
                                        textTransform="uppercase"
                                        fontSize="9px"
                                      >
                                        {item.type}
                                      </Badge>
                                      <Text fontSize="xs" fontWeight="700" color="gray.800" isTruncated maxW="280px">
                                        {item.title}
                                      </Text>
                                    </HStack>

                                    {/* File Matching Status Badge */}
                                    {item.fileName ? (
                                      <Badge
                                        colorPalette={isFileMatched ? "green" : "red"}
                                        size="sm"
                                        variant="subtle"
                                        fontSize="9px"
                                      >
                                        📁 File: {item.fileName} {isFileMatched ? "(Matched)" : "(Not Uploaded Yet)"}
                                      </Badge>
                                    ) : item.url ? (
                                      <HStack gap={1} fontSize="10px" color="blue.600">
                                        <Icon as={FiExternalLink} boxSize={2.5} />
                                        <Text as="a" href={item.url} target="_blank" rel="noopener noreferrer" isTruncated maxW="280px" _hover={{ textDecoration: "underline" }}>
                                          {item.url}
                                        </Text>
                                      </HStack>
                                    ) : (
                                      <Badge colorPalette="red" size="sm" variant="subtle" fontSize="9px">
                                        ⚠️ Missing File Name
                                      </Badge>
                                    )}

                                    {item.description && (
                                      <Text fontSize="11px" color="gray.500" noOfLines={2}>
                                        {item.description}
                                      </Text>
                                    )}

                                    {/* Topic matching status */}
                                    <HStack gap={1.5} mt={0.5} wrap="wrap">
                                      {effectiveTopicObj ? (
                                        <Badge colorPalette={item.matchedTopicId ? "green" : "blue"} size="sm" variant="subtle" fontSize="9px">
                                          Topic: {effectiveTopicObj.name} {item.matchedTopicId ? "(Matched)" : "(Fallback)"}
                                        </Badge>
                                      ) : item.topicName ? (
                                        <Badge colorPalette="purple" size="sm" variant="subtle" fontSize="9px">
                                          ✨ Sync Topic: {item.topicName} (Auto-created)
                                        </Badge>
                                      ) : (
                                        <Badge colorPalette="orange" size="sm" variant="subtle" fontSize="9px">
                                          Default Topic: General Resources
                                        </Badge>
                                      )}

                                      {item.subTopicName && (
                                        <Badge colorPalette="teal" size="sm" variant="outline" fontSize="9px">
                                          Subtopic: {item.subTopicName} (Auto-synced)
                                        </Badge>
                                      )}
                                    </HStack>
                                  </VStack>

                                  <IconButton
                                    aria-label="Remove resource"
                                    size="xs"
                                    variant="ghost"
                                    color="gray.400"
                                    _hover={{ color: "red.500" }}
                                    onClick={() => removeBulkParsedResource(idx)}
                                  >
                                    <Icon as={FiTrash2} boxSize={3} />
                                  </IconButton>
                                </HStack>
                              </Box>
                            );
                          })}
                        </VStack>
                      </Box>
                    )}

                    {/* Commit Bulk Resource Button */}
                    <Button
                      bg="blue.500"
                      color="white"
                      rounded="xl"
                      h={11}
                      onClick={commitBulkResourceImport}
                      loading={bulkResourceImportLoading}
                      disabled={
                        !selectedClass[0] ||
                        !selectedSubject[0] ||
                        bulkParsedResources.length === 0 ||
                        bulkResourceImportLoading
                      }
                    >
                      {bulkParsedResources.length > 0
                        ? `Import ${bulkParsedResources.length} Academic Resource${bulkParsedResources.length !== 1 ? "s" : ""}`
                        : "Import Academic Resources"}
                    </Button>
                  </>
                )}
              </VStack>
            </SectionCard>
          </VStack>

          {/* ══ RIGHT COLUMN — Quiz Questions ══ */}
          <GridItem>
            <SectionCard icon={MdQuiz} title="Quiz Questions" subtitle="Per subject & topic parameters" accentColor="blue.500">
              <VStack gap={4} align="stretch">
                <Grid templateColumns="1fr 1fr" gap={3}>
                  <StyledSelect collection={classCollection} value={quizSelectedClass} onValueChange={(e) => setQuizSelectedClass(e.value)} label="Class" placeholder="Select class" />
                  <StyledSelect collection={subjectCollection} value={quizSelectedSubject} onValueChange={(e) => setQuizSelectedSubject(e.value)} label="Subject" placeholder="Select subject" />
                </Grid>

                <StyledSelect collection={quizTopicCollection} value={quizSelectedTopic} onValueChange={(e) => setQuizSelectedTopic(e.value)} label="Topic" placeholder="Select topic" disabled={!quizSelectedClass[0] || !quizSelectedSubject[0] || quizTopics.length === 0} />

                {/* Subtopic Dropdown for Quiz */}
                <Box>
                  <StyledSelect
                    collection={quizSubTopicCollection}
                    value={quizSelectedSubtopics}
                    onValueChange={(e) => {
                      if (quizActiveTab === "manual") {
                        // In manual mode, enforce single selection (keep the latest selected item)
                        setQuizSelectedSubtopics(e.value.slice(-1));
                      } else {
                        // In CSV import mode, support multiple selections
                        setQuizSelectedSubtopics(e.value);
                      }
                    }}
                    multiple={quizActiveTab === "import"}
                    label={`Subtopic${quizActiveTab === "import" ? "s (Multi-Select for CSV)" : " (Single Select)"}`}
                    placeholder={
                      !quizSelectedClass[0] || !quizSelectedSubject[0]
                        ? "Select class & subject first"
                        : !quizSelectedTopic[0]
                        ? "Select topic first"
                        : quizSubTopics.length === 0
                        ? "No subtopics found for this topic (Optional)"
                        : quizActiveTab === "import"
                        ? (quizSelectedSubtopics.length === 0 ? "All subtopics (or select specific ones)..." : `${quizSelectedSubtopics.length} subtopic(s) selected`)
                        : "Select subtopic..."
                    }
                    disabled={!quizSelectedTopic[0] || quizSubTopics.length === 0}
                  />

                  {quizSubTopics.length > 0 && quizActiveTab === "import" && (
                    <HStack justify="space-between" mt={1.5} align="center">
                      <Text fontSize="10px" color="gray.500">
                        {quizSelectedSubtopics.length > 0
                          ? `${quizSelectedSubtopics.length} of ${quizSubTopics.length} subtopics selected`
                          : "All subtopics allowed in CSV template"}
                      </Text>
                      <HStack gap={1.5}>
                        <Button
                          size="xs"
                          variant="ghost"
                          fontSize="10px"
                          h={5}
                          px={1.5}
                          color="blue.600"
                          onClick={() => setQuizSelectedSubtopics(quizSubTopics.map((s) => s.id))}
                        >
                          Select All
                        </Button>
                        {quizSelectedSubtopics.length > 0 && (
                          <Button
                            size="xs"
                            variant="ghost"
                            fontSize="10px"
                            h={5}
                            px={1.5}
                            color="gray.500"
                            onClick={() => setQuizSelectedSubtopics([])}
                          >
                            Clear
                          </Button>
                        )}
                      </HStack>
                    </HStack>
                  )}
                </Box>

                {quizSelectedTopic[0] && (
                  <Flex
                    justify="space-between"
                    align="center"
                    p={3}
                    bg="blue.50/50"
                    border="1px solid"
                    borderColor="blue.100"
                    borderRadius="xl"
                  >
                    <HStack gap={2}>
                      <Badge colorPalette="blue" variant="subtle" size="sm" px={2} py={0.5} borderRadius="md">
                        Topic Question Bank
                      </Badge>
                      <Text fontSize="xs" fontWeight="600" color="gray.700">
                        {quizTopics.find((t) => t.id === quizSelectedTopic[0])?.name}
                      </Text>
                    </HStack>
                    <Badge colorPalette="purple" variant="surface" size="sm" px={2} py={0.5} borderRadius="full">
                      {quizQuestionCount} Total Questions
                    </Badge>
                  </Flex>
                )}

                <Tabs.Root 
                  value={quizActiveTab} 
                  onValueChange={(e) => {
                    const nextTab = e.value as "manual" | "import";
                    setQuizActiveTab(nextTab);
                    if (nextTab === "manual" && quizSelectedSubtopics.length > 1) {
                      // Clamp to 1 subtopic when switching to manual mode
                      setQuizSelectedSubtopics((prev) => prev.slice(0, 1));
                    }
                  }} 
                  variant="enclosed" 
                  size="sm"
                >
                  <Tabs.List bg="gray.100" borderRadius="lg" p={0.5}>
                    <Tabs.Trigger value="manual" flex={1} borderRadius="md" fontSize="xs" fontWeight="600" _selected={{ bg: "white", color: "gray.800" }}>✏️ Manual Mode</Tabs.Trigger>
                    <Tabs.Trigger value="import" flex={1} borderRadius="md" fontSize="xs" fontWeight="600" _selected={{ bg: "white", color: "gray.800" }}><Icon as={FiUpload} mr={1} /> Bulk CSV Import</Tabs.Trigger>
                  </Tabs.List>

                  <Tabs.Content value="manual" pt={4}>
                    <VStack gap={3} align="stretch">
                      {isMultipleSubtopicsSelected && (
                        <Box p={3} bg="orange.50" border="1px solid" borderColor="orange.200" borderRadius="xl">
                          <HStack justify="space-between" align="center">
                            <VStack align="start" gap={0.5}>
                              <Text fontSize="xs" fontWeight="700" color="orange.800">
                                Multiple subtopics selected ({quizSelectedSubtopics.length})
                              </Text>
                              <Text fontSize="11px" color="orange.700">
                                Manual mode requires a single subtopic. Please switch to Bulk CSV Import or select 1 subtopic.
                              </Text>
                            </VStack>
                            <Button
                              size="xs"
                              bg="orange.500"
                              color="white"
                              _hover={{ bg: "orange.600" }}
                              onClick={() => setQuizActiveTab("import")}
                            >
                              Use CSV Import
                            </Button>
                          </HStack>
                        </Box>
                      )}

                      <Box maxH="440px" overflowY="auto">
                        {questions.map((q, idx) => (
                          <Box key={idx} border="1px solid" borderColor="gray.100" borderRadius="xl" p={4} bg="gray.50" mb={3} position="relative">
                            <Box position="absolute" left={0} top={0} bottom={0} w="3px" bg="blue.500" />
                            <HStack justify="space-between" mb={2}>
                              <Badge bg="blue.500" color="white" borderRadius="md">Q{idx + 1}</Badge>
                              <IconButton aria-label="Delete" size="xs" variant="ghost" disabled={questions.length === 1} onClick={() => removeQuestion(idx)}><Icon as={FiTrash2} /></IconButton>
                            </HStack>

                            <VStack gap={2.5} align="stretch">
                              <Box>
                                <Text fontSize="10px" fontWeight="700" color="gray.500" textTransform="uppercase" letterSpacing="0.05em" mb={1}>
                                  Question Prompt
                                </Text>
                                <Textarea placeholder="Question description text prompt..." value={q.question_text} onChange={(e) => updateQuestion(idx, "question_text", e.target.value)} bg="white" fontSize="sm" rows={2} resize="none" />
                              </Box>
                              
                              <Box>
                                {q.image_preview ? (
                                  <Box position="relative" display="inline-block">
                                    <img src={q.image_preview} alt="Attached structural graphic" style={{ maxHeight: "100px", borderRadius: "6px" }} />
                                    <IconButton aria-label="Clear" size="xs" position="absolute" top={1} right={1} bg="red.500" color="white" borderRadius="full" onClick={() => updateQuestionImage(idx, null)}><Icon as={FiX} boxSize={2} /></IconButton>
                                  </Box>
                                ) : (
                                  <label htmlFor={`manual-img-${idx}`} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", background: "white", border: "1px dashed #CBD5E0", borderRadius: "6px", cursor: "pointer", width: "fit-content" }}>
                                    <input id={`manual-img-${idx}`} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { updateQuestionImage(idx, e.target.files?.[0] ?? null); e.target.value = ""; }} />
                                    <Icon as={FiImage} color="gray.400" /><Text fontSize="10px" color="gray.500">Attach Question Illustration Image File</Text>
                                  </label>
                                )}
                              </Box>

                              <Grid templateColumns="1fr 1fr" gap={2}>
                                {(["a", "b", "c", "d"] as const).map(opt => (
                                  <HStack key={opt} bg="white" border="1px solid" borderColor="gray.200" borderRadius="md" px={2} h={8}>
                                    <Text fontSize="10px" fontWeight="800" color="gray.400">{opt.toUpperCase()}</Text>
                                    <Input placeholder={`Option value`} value={q[`option_${opt}` as keyof QuizQuestion] as string} onChange={(e) => updateQuestion(idx, `option_${opt}` as keyof QuizQuestion, e.target.value)} variant="subtle" fontSize="xs" />
                                  </HStack>
                                ))}
                              </Grid>

                              <StyledSelect collection={correctOptionCollection} value={q.correct_option ? [q.correct_option] : []} onValueChange={(e) => updateQuestion(idx, "correct_option", e.value[0] ?? "")} label="Correct Option Solution Key" placeholder="Select correct answer" size="sm" />

                              {/* Question Specific Subtopic Selector */}
                              {quizSubTopics.length > 0 && (
                                <StyledSelect
                                  collection={createListCollection<SelectItem>({
                                    items: [
                                      { label: "Default (Use Topic Selection)", value: "" },
                                      ...quizSubTopics.map((st) => ({
                                        label: st.name,
                                        value: st.id,
                                      })),
                                    ],
                                  })}
                                  value={q.subtopic_id ? [q.subtopic_id] : []}
                                  onValueChange={(e) => updateQuestion(idx, "subtopic_id", e.value[0] ?? "")}
                                  label="Question Subtopic (Optional)"
                                  placeholder={
                                    quizSelectedSubtopics[0]
                                      ? `Inherit: ${quizSubTopics.find((s) => s.id === quizSelectedSubtopics[0])?.name || "Selected"}`
                                      : "Select subtopic..."
                                  }
                                  size="sm"
                                />
                              )}

                              {/* Answer Explanation field */}
                              <Box>
                                <Text fontSize="10px" fontWeight="700" color="gray.500" textTransform="uppercase" letterSpacing="0.05em" mb={1}>
                                  Explanation to Answer (Optional)
                                </Text>
                                <Textarea
                                  placeholder="Provide step-by-step solution rationale or answer explanation..."
                                  value={q.answer_explanation || ""}
                                  onChange={(e) => updateQuestion(idx, "answer_explanation", e.target.value)}
                                  bg="white"
                                  fontSize="xs"
                                  rows={2}
                                  resize="none"
                                />
                              </Box>
                            </VStack>
                          </Box>
                        ))}
                      </Box>
                      <Button variant="outline" size="sm" onClick={addQuestion} borderColor="blue.300" color="blue.500"><Icon as={FiPlus} /> Add Question Block</Button>
                      <Button bg="blue.500" color="white" rounded="xl" onClick={handleQuizUpload} disabled={quizUploadDisabled} loading={quizLoading}>Upload Manual Quiz Data</Button>
                    </VStack>
                  </Tabs.Content>

                  <Tabs.Content value="import" pt={4}>
                    <VStack gap={4} align="stretch">
                      <HStack bg="blue.50" p={3} borderRadius="xl" justify="space-between">
                        <Box>
                          <Text fontSize="xs" fontWeight="700" color="blue.800">Download Spreadsheet Template</Text>
                          <Text fontSize="10px" color="blue.500">Includes columns: subtopic_name, answer_explanation, image_file_name</Text>
                        </Box>
                        <Button onClick={downloadCsvTemplate} size="sm" bg="blue.500" color="white"><Icon as={FiDownload} /> Get Template</Button>
                      </HStack>

                      {/* Available Subtopics Reference helper */}
                      {quizSubTopics.length > 0 && (
                        <Box p={3} bg="gray.50" border="1px solid" borderColor="gray.200" borderRadius="xl">
                          <Text fontSize="xs" fontWeight="700" color="gray.700" mb={1}>
                            Available Subtopics for this Topic:
                          </Text>
                          <HStack flexWrap="wrap" gap={1.5} mb={1}>
                            {quizSubTopics.map((st) => {
                              const isSelected = quizSelectedSubtopics.length === 0 || quizSelectedSubtopics.includes(st.id);
                              return (
                                <Badge
                                  key={st.id}
                                  bg={isSelected ? "blue.500" : "gray.200"}
                                  color={isSelected ? "white" : "gray.600"}
                                  fontSize="10px"
                                  px={2}
                                  py={0.5}
                                  borderRadius="md"
                                >
                                  {st.name}
                                </Badge>
                              );
                            })}
                          </HStack>
                          <Text fontSize="10px" color="gray.500">
                            Type any of these subtopic names into the <Code fontSize="10px" color="blue.600">subtopic_name</Code> column in your CSV to assign questions directly.
                          </Text>
                        </Box>
                      )}

                      <Box>
                        <Text {...fieldLabelProps}>Step 1: Upload CSV/Excel Sheet</Text>
                        <label htmlFor="csv-picker-node" style={{ display: "block", padding: "16px", border: "2px dashed #E2E8F0", borderRadius: "12px", textAlign: "center", cursor: "pointer", background: "#F7FAFC" }}>
                          <input id="csv-picker-node" type="file" accept=".csv,.xlsx,.xls" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) parseImportFile(f); e.target.value = ""; }} />
                          <Icon as={FiFile} boxSize={5} color="blue.400" mb={1} />
                          <Text fontSize="xs" color="gray.600">{importFileName || "Choose your populated template spreadsheet file"}</Text>
                        </label>
                      </Box>

                      <Box>
                        <Text {...fieldLabelProps}>Step 2: Upload Accompanying Question Images</Text>
                        <label htmlFor="images-bulk-node" style={{ display: "block", padding: "16px", border: "2px dashed #E2E8F0", borderRadius: "12px", textAlign: "center", cursor: "pointer", background: "#F7FAFC" }}>
                          <input id="images-bulk-node" type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => { if (e.target.files) setBulkImageFiles(Array.from(e.target.files)); }} />
                          <Icon as={FiImage} boxSize={5} color="blue.400" mb={1} />
                          <Text fontSize="xs" color="gray.600">Select all files referenced under image_file_name column</Text>
                        </label>
                        {bulkImageFiles.length > 0 && (
                          <Box mt={2}><Badge colorScheme="blue" variant="subtle">{bulkImageFiles.length} images cross-referenced</Badge></Box>
                        )}
                      </Box>

                      {importError && (
                        <Alert.Root status="error" variant="subtle" borderRadius="md">
                          <Alert.Content><Alert.Description fontSize="xs">{importError}</Alert.Description></Alert.Content>
                        </Alert.Root>
                      )}

                      {importedQuestions.length > 0 && (
                        <Box>
                          <Text {...fieldLabelProps}>Import Preview Breakdown</Text>
                          <VStack gap={2} align="stretch" maxH="220px" overflowY="auto">
                            {importedQuestions.map((q, i) => (
                              <HStack key={i} p={2.5} bg="white" border="1px solid" borderColor="gray.100" borderRadius="md" align="start">
                                <Badge bg="blue.500" color="white" fontSize="9px">Q{i + 1}</Badge>
                                <VStack align="start" gap={1} flex={1}>
                                  <Text fontSize="xs" fontWeight="600" color="gray.700">{q.question_text}</Text>
                                  <HStack flexWrap="wrap" gap={1.5}>
                                    <Badge bg="blue.50" color="blue.700" fontSize="9px">
                                      Option: {q.correct_option.toUpperCase()}
                                    </Badge>
                                    {q.subtopic_name ? (
                                      <Badge bg="blue.50" color="blue.700" fontSize="9px">
                                        Subtopic: {q.subtopic_name} {q.subtopic_id ? "✓" : "⚡ (Auto-link)"}
                                      </Badge>
                                    ) : quizSelectedSubtopics.length > 0 ? (
                                      <Badge bg="green.50" color="green.700" fontSize="9px">
                                        Subtopic: {quizSubTopics.find(s => s.id === quizSelectedSubtopics[0])?.name || "Selected"} (Default)
                                      </Badge>
                                    ) : null}
                                    {q.answer_explanation && (
                                      <Badge bg="purple.50" color="purple.700" fontSize="9px">
                                        📝 Explanation Added
                                      </Badge>
                                    )}
                                    {q.csv_image_name && (
                                      <Badge colorScheme={bulkImageFiles.some(f => f.name === q.csv_image_name) ? "green" : "red"} fontSize="9px">
                                        📸 File: {q.csv_image_name} {bulkImageFiles.some(f => f.name === q.csv_image_name) ? "(Matched)" : "(Not Uploaded Yet)"}
                                      </Badge>
                                    )}
                                  </HStack>
                                  {q.answer_explanation && (
                                    <Text fontSize="10px" color="gray.500" fontStyle="italic">
                                      Explanation: {q.answer_explanation}
                                    </Text>
                                  )}
                                </VStack>
                              </HStack>
                            ))}
                          </VStack>
                        </Box>
                      )}

                      <Button bg="blue.500" color="white" rounded="xl" h={11} onClick={handleFileImportUpload} disabled={!importedQuestions.length || quizLoading} loading={quizLoading}>
                        Upload {importedQuestions.length} Checked CSV Items
                      </Button>
                    </VStack>
                  </Tabs.Content>
                </Tabs.Root>
              </VStack>
            </SectionCard>
          </GridItem>

        </Grid>
      </Box>
    </Box>
  );
};

export default CMS;