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
import { FiFile, FiX, FiPlus, FiTrash2, FiDownload, FiUpload, FiImage } from "react-icons/fi";
import { IoCloudUploadOutline } from "react-icons/io5";
import { MdQuiz } from "react-icons/md";
import { HiOutlineDocumentArrowUp } from "react-icons/hi2";
import { MdPlaylistAdd } from "react-icons/md";
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
      bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100"
      overflow="hidden" boxShadow="0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)"
      h="fit-content"
    >
      <Box h="3px" bg={accentColor} />
      <Box px={6} pt={5} pb={4} borderBottom="1px solid" borderColor="gray.50">
        <HStack gap={3}>
          <Box bg={`${colorBase}.50`} p={2} borderRadius="lg">
            <Icon as={icon} boxSize={5} color={accentColor} />
          </Box>
          <Box>
            <Text fontWeight="700" fontSize="md" color="gray.800" lineHeight="1.2">{title}</Text>
            <Text fontSize="xs" color="gray.400" mt={0.5}>{subtitle}</Text>
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
  const [topicCreationTab, setTopicCreationTab] = useState<"new_topic" | "existing_topic">("new_topic");
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

  // Left Column (Resources) States
  const [selectedClass, setSelectedClass] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string[]>([]);
  const [resourceSubTopics, setResourceSubTopics] = useState<SubTopic[]>([]);
  const [selectedSubTopicId, setSelectedSubTopicId] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

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

  // ── Resource Upload Handlers ──
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (accepted) => setFiles((p) => [...p, ...accepted]),
    multiple: false,
  });
  const removeFile = (i: number) => setFiles((p) => p.filter((_, j) => j !== i));

  const uploadFileToSupabase = async (file: File, type: string) => {
    const folder = type === "video" ? "Videos" : type === "pqs" ? "PastQuestions" : "PDFs";
    const ext = file.name.split(".").pop();
    const path = `${folder}/${Math.random().toString(36).substring(2)}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("test-resource").upload(path, file);
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
                      <Text fontSize="sm" color="gray.400" mt={1}>
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
                {/* Tabs to switch between creating a new topic or adding subtopics to an existing topic */}
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
                    ＋ New Course Topic
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
                    Add Subtopics to Existing Topic
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
                ) : (
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
                )}
              </VStack>
            </SectionCard>

            {/* 2. Academic Resources */}
            <SectionCard icon={HiOutlineDocumentArrowUp} title="Academic Resources" subtitle="PDFs, videos & resource documents" accentColor="blue.500">
              <VStack gap={4} align="stretch">
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
                      <Icon as={IoCloudUploadOutline} boxSize={5} color="blue.400" />
                      <Text fontSize="xs" color="gray.400">{isDragActive ? "Drop here" : "Browse or drop academic file item here"}</Text>
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