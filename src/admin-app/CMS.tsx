"use client";

import {
  Portal,
  Select,
  createListCollection,
  Box,
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
interface Quiz { id: string; subject_id: string; topic_id: string; class_id: string }
interface QuizQuestion {
  question_text: string;
  option_a: string; option_b: string; option_c: string; option_d: string;
  correct_option: "a" | "b" | "c" | "d" | "";
  image_file?: File | null;
  image_preview?: string | null;
  csv_image_name?: string;
}

const emptyQuestion = (): QuizQuestion => ({
  question_text: "", option_a: "", option_b: "", option_c: "", option_d: "",
  correct_option: "", image_file: null, image_preview: null, csv_image_name: "",
});

/* ── Reusable styled select ── */
interface SelectItem { label: string; value: string }
const StyledSelect = ({
  collection, value, onValueChange, label, placeholder, disabled = false, size,
}: {
  collection: ReturnType<typeof createListCollection<SelectItem>>;
  value: string[]; onValueChange: (e: any) => void;
  label: string; placeholder: string; disabled?: boolean; size?: 'xs' | 'sm' | 'md' | 'lg';
}) => (
  <Box>
    <Select.Root
      collection={collection} width="100%" variant="subtle"
      value={value} onValueChange={onValueChange} disabled={disabled}
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
  const [newTopicName, setNewTopicName] = useState("");
  const [newTopicDescription, setNewTopicDescription] = useState("");
  const [topicClass, setTopicClass] = useState<string[]>([]);
  const [topicSubject, setTopicSubject] = useState<string[]>([]);
  const [topicLoading, setTopicLoading] = useState(false);

  // Left Column (Resources) States
  const [selectedClass, setSelectedClass] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Right Column (Quiz) States
  const [quizSelectedClass, setQuizSelectedClass] = useState<string[]>([]);
  const [quizSelectedSubject, setQuizSelectedSubject] = useState<string[]>([]);
  const [quizTopics, setQuizTopics] = useState<Topic[]>([]);
  const [quizSelectedTopic, setQuizSelectedTopic] = useState<string[]>([]);
  
  const [questions, setQuestions] = useState<QuizQuestion[]>([emptyQuestion()]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizSelectedQuiz, setQuizSelectedQuiz] = useState<string[]>([]);

  const [importedQuestions, setImportedQuestions] = useState<QuizQuestion[]>([]);
  const [importFileName, setImportFileName] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [bulkImageFiles, setBulkImageFiles] = useState<File[]>([]);

  // ── Lifecycles & Data Syncing ──
  useEffect(() => { fetchInitialData(); }, []);

  // Sync resource context topics list dynamically
  useEffect(() => {
    setSelectedTopicId([]); // Reset selection when parent dependencies change
    if (selectedClass[0] && selectedSubject[0]) {
      fetchTopics(selectedClass[0], selectedSubject[0]);
    } else { 
      setTopics([]); 
    }
  }, [selectedClass, selectedSubject]);

  // Sync quiz parameter topics list dynamically
  useEffect(() => {
    setQuizSelectedTopic([]); // Reset selection when parent dependencies change
    if (quizSelectedClass[0] && quizSelectedSubject[0]) {
      fetchQuizTopics(quizSelectedClass[0], quizSelectedSubject[0]);
    } else {
      setQuizTopics([]);
    }
    setQuizzes([]);
    setQuizSelectedQuiz([]);
  }, [quizSelectedClass, quizSelectedSubject]);

  // Sync active quizzes list
  useEffect(() => {
    if (quizSelectedClass[0] && quizSelectedSubject[0] && quizSelectedTopic[0]) {
      fetchQuizzes(quizSelectedClass[0], quizSelectedSubject[0], quizSelectedTopic[0]);
    } else { 
      setQuizzes([]); 
      setQuizSelectedQuiz([]); 
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

  const fetchQuizTopics = async (classId: string, subjectId: string) => {
    const { data } = await supabase.from("topics")
      .select("id, name, description, class_id, subject_id, order_index")
      .eq("class_id", classId).eq("subject_id", subjectId).order("name");
    setQuizTopics(data || []);
  };

  const fetchQuizzes = async (classId: string, subjectId: string, topicId: string) => {
    const { data } = await supabase
      .from("quizzes")
      .select("id, subject_id, topic_id, class_id")
      .eq("class_id", classId)
      .eq("subject_id", subjectId)
      .eq("topic_id", topicId);
    setQuizzes(data || []);
  };

  // ── Standalone Topic Creator Function ──
  const handleCreateTopic = async () => {
    if (!topicClass[0] || !topicSubject[0] || !newTopicName.trim()) {
      setAlert({ type: "error", message: "Please fill all required topic fields." });
      return;
    }
    setTopicLoading(true);
    try {
      const { error } = await supabase
        .from("topics")
        .insert([{
          name: newTopicName.trim(),
          class_id: topicClass[0],
          subject_id: topicSubject[0],
          description: newTopicDescription.trim() || "Managed subject course component entry",
          order_index: 0
        }]);

      if (error) throw error;

      setAlert({ type: "success", message: `Topic "${newTopicName}" saved successfully!` });
      setNewTopicName("");
      setNewTopicDescription("");
      
      // Force an immediate refresh for whatever class/subject combination you just added a topic to!
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
      const resourceTitle = selectedTopicObj ? selectedTopicObj.name : "Resource Item";

      const fileUrl = await uploadFileToSupabase(files[0], fileType[0]);
      
      const { error } = await supabase.from("resources").insert([{
        class_id: selectedClass[0], 
        subject_id: selectedSubject[0], 
        topic_id: selectedTopicId[0],
        title: resourceTitle,
        description, 
        type: fileType[0], 
        duration: 0, 
        order_index: 0, 
        url: fileUrl,
      }]);
      
      if (error) throw error;
      setAlert({ type: "success", message: "Resource saved effectively!" });
      setFiles([]); setFileType([]); setSelectedClass([]); setSelectedSubject([]); setSelectedTopicId([]);
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
    if (quizSelectedQuiz[0] && quizSelectedQuiz[0] !== "__new__") return quizSelectedQuiz[0];
    const { data, error } = await supabase
      .from("quizzes")
      .insert({ class_id: quizSelectedClass[0], subject_id: quizSelectedSubject[0], topic_id: quizSelectedTopic[0] })
      .select("id").single();

    if (error) { setAlert({ type: "error", message: "Failed to locate target quiz model: " + error.message }); return null; }
    await fetchQuizzes(quizSelectedClass[0], quizSelectedSubject[0], quizSelectedTopic[0]);
    setQuizSelectedQuiz([data.id]);
    return data.id;
  };

  const handleQuizUpload = async () => {
    if (!quizSelectedClass[0] || !quizSelectedSubject[0] || !quizSelectedTopic[0]) {
      setAlert({ type: "error", message: "Please ensure Class, Subject, and Topic parameters align correctly." }); return;
    }
    if (questions.some((q) => !isQuestionValid(q))) {
      setAlert({ type: "error", message: "Fill all variant block spaces for active layout configurations." }); return;
    }
    setQuizLoading(true);
    try {
      const quizId = await createOrGetQuiz();
      if (!quizId) { setQuizLoading(false); return; }

      const rows = await Promise.all(
        questions.map(async (q) => {
          let image_url: string | null = null;
          if (q.image_file) image_url = await uploadQuestionImage(q.image_file);
          const { image_file, image_preview, csv_image_name, ...rest } = q;
          return { ...rest, image_url, subject_id: quizSelectedSubject[0], topic_id: quizSelectedTopic[0], quiz_id: quizId };
        })
      );
      const { error } = await supabase.from("questions").insert(rows);
      if (error) throw error;
      setAlert({ type: "success", message: `${rows.length} manual questions loaded into your database!` });
      setQuestions([emptyQuestion()]);
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
        const rows: Record<string, string>[] = XLSX.utils.sheet_to_json(ws, { defval: "" });
        if (!rows.length) { setImportError("File contains no row lines."); return; }
        const missing = REQUIRED_HEADERS.filter((h) => !Object.keys(rows[0]).includes(h));
        if (missing.length) { setImportError(`Missing columns: ${missing.join(", ")}. Use the template.`); return; }
        
        const parsed: QuizQuestion[] = []; const errs: string[] = [];
        rows.forEach((row, i) => {
          const co = String(row.correct_option).toLowerCase().trim();
          if (!["a", "b", "c", "d"].includes(co)) { errs.push(`Row ${i + 2}: correct_option must be a–d`); return; }
          if (!row.question_text?.toString().trim()) { errs.push(`Row ${i + 2}: question_text is empty`); return; }
          parsed.push({
            question_text: String(row.question_text).trim(),
            option_a: String(row.option_a).trim(), option_b: String(row.option_b).trim(),
            option_c: String(row.option_c).trim(), option_d: String(row.option_d).trim(),
            correct_option: co as any,
            csv_image_name: row.image_file_name ? String(row.image_file_name).trim() : "",
          });
        });
        if (errs.length) { setImportError(errs.slice(0, 3).join(" · ")); return; }
        setImportedQuestions(parsed);
      } catch { setImportError("Could not parse spreadsheet accurately."); }
    };
    reader.readAsArrayBuffer(file);
  };

  const downloadCsvTemplate = () => {
    const headers = ["question_text", "option_a", "option_b", "option_c", "option_d", "correct_option", "image_file_name"];
    const examples = [["Sample Equation Problem Prompt?", "1", "2", "3", "4", "C", "asset_illustration.png"]];
    const csvRows = [headers.join(","), ...examples.map((row) => row.map((cell) => `"${cell}"`).join(","))];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "quiz_template.csv"; a.click(); URL.revokeObjectURL(url);
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

      const rows = importedQuestions.map((q) => {
        const { image_file, image_preview, csv_image_name, ...rest } = q;
        let matchedUrl = null;
        if (csv_image_name && nameToUrlMap[csv_image_name]) matchedUrl = nameToUrlMap[csv_image_name];
        return { ...rest, image_url: matchedUrl, subject_id: quizSelectedSubject[0], topic_id: quizSelectedTopic[0], quiz_id: quizId };
      });

      const { error } = await supabase.from("questions").insert(rows);
      if (error) throw error;
      setAlert({ type: "success", message: `${rows.length} CSV questions processed successfully!` });
      setImportedQuestions([]); setImportFileName(null); setBulkImageFiles([]);
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
  const quizTopicCollection = useMemo(() => createListCollection<SelectItem>({ items: quizTopics.map((t) => ({ label: t.name, value: t.id })) }), [quizTopics]);

  const quizUploadDisabled = !quizSelectedClass[0] || !quizSelectedSubject[0] || !quizSelectedTopic[0] || questions.some((q) => !isQuestionValid(q)) || quizLoading;

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
            
            {/* 1. Add New Topic */}
            <SectionCard icon={MdPlaylistAdd} title="Create Course Topic" subtitle="Add raw subject parameters straight to database" accentColor="blue.500">
              <VStack gap={4} align="stretch">
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
                <Button bg="blue.500" color="white" rounded="xl" h={10} fontSize="sm" fontWeight="600" onClick={handleCreateTopic} loading={topicLoading} disabled={!topicClass[0] || !topicSubject[0] || !newTopicName.trim()}>
                  Add New Topic
                </Button>
              </VStack>
            </SectionCard>

            {/* 2. Academic Resources */}
            <SectionCard icon={HiOutlineDocumentArrowUp} title="Academic Resources" subtitle="PDFs, videos & resource documents" accentColor="blue.500">
              <VStack gap={4} align="stretch">
                <Grid templateColumns="1fr 1fr" gap={3}>
                  <StyledSelect collection={classCollection} value={selectedClass} onValueChange={(e) => setSelectedClass(e.value)} label="Class Filter" placeholder="Select class" />
                  <StyledSelect collection={subjectCollection} value={selectedSubject} onValueChange={(e) => setSelectedSubject(e.value)} label="Subject Filter" placeholder="Select subject" />
                </Grid>

                {/* Fixed collection link pointing accurately to topicCollection memo wire */}
                <StyledSelect 
                  collection={topicCollection} value={selectedTopicId} onValueChange={(e) => setSelectedTopicId(e.value)} 
                  label="Select Course Topic" 
                  placeholder={!selectedClass[0] || !selectedSubject[0] ? "Select class & subject first" : topics.length === 0 ? "No topics found matching selections" : "Choose topic..."} 
                  disabled={!selectedClass[0] || !selectedSubject[0] || topics.length === 0} 
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

                <Box>
                  <Text {...fieldLabelProps}>Quiz Target Selection</Text>
                  {!quizSelectedClass[0] || !quizSelectedSubject[0] || !quizSelectedTopic[0] ? (
                    <Box px={3} py={2} bg="gray.50" borderRadius="lg"><Text fontSize="xs" color="gray.400">Select Class, Subject & Topic parameters above</Text></Box>
                  ) : quizzes.length === 0 ? (
                    <Box p={3} bg="orange.50" borderRadius="lg">
                      <Text fontSize="xs" color="orange.700" fontWeight="600">No active test workspace exists here. A new quiz entity will automatically be initialized upon submission.</Text>
                    </Box>
                  ) : (
                    <Box>
                      <StyledSelect
                        collection={createListCollection({
                          items: [...quizzes.map((q, idx) => ({ label: `Quiz Workspace ${idx + 1}`, value: q.id })), { label: "＋ Create standard new quiz entity", value: "__new__" }]
                        })}
                        value={quizSelectedQuiz} onValueChange={(e) => setQuizSelectedQuiz(e.value)} label="Choose Target Quiz" placeholder="Select variant..."
                      />
                    </Box>
                  )}
                </Box>

                <Tabs.Root defaultValue="manual" variant="enclosed" size="sm">
                  <Tabs.List bg="gray.100" borderRadius="lg" p={0.5}>
                    <Tabs.Trigger value="manual" flex={1} borderRadius="md" fontSize="xs" fontWeight="600" _selected={{ bg: "white", color: "gray.800" }}>✏️ Manual Mode</Tabs.Trigger>
                    <Tabs.Trigger value="import" flex={1} borderRadius="md" fontSize="xs" fontWeight="600" _selected={{ bg: "white", color: "gray.800" }}><Icon as={FiUpload} mr={1} /> Bulk CSV Import</Tabs.Trigger>
                  </Tabs.List>

                  <Tabs.Content value="manual" pt={4}>
                    <VStack gap={3} align="stretch">
                      <Box maxH="440px" overflowY="auto">
                        {questions.map((q, idx) => (
                          <Box key={idx} border="1px solid" borderColor="gray.100" borderRadius="xl" p={4} bg="gray.50" mb={3} position="relative">
                            <Box position="absolute" left={0} top={0} bottom={0} w="3px" bg="blue.500" />
                            <HStack justify="space-between" mb={2}>
                              <Badge bg="blue.500" color="white" borderRadius="md">Q{idx + 1}</Badge>
                              <IconButton aria-label="Delete" size="xs" variant="ghost" disabled={questions.length === 1} onClick={() => removeQuestion(idx)}><Icon as={FiTrash2} /></IconButton>
                            </HStack>

                            <VStack gap={2} align="stretch">
                              <Textarea placeholder="Question description text prompt..." value={q.question_text} onChange={(e) => updateQuestion(idx, "question_text", e.target.value)} bg="white" fontSize="sm" rows={2} resize="none" />
                              
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
                          <Text fontSize="10px" color="blue.500">Tracking index column matching: "image_file_name"</Text>
                        </Box>
                        <Button onClick={downloadCsvTemplate} size="sm" bg="blue.500" color="white"><Icon as={FiDownload} /> Get Template</Button>
                      </HStack>

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
                          <VStack gap={2} align="stretch" maxH="180px" overflowY="auto">
                            {importedQuestions.map((q, i) => (
                              <HStack key={i} p={2.5} bg="white" border="1px solid" borderColor="gray.100" borderRadius="md" align="start">
                                <Badge bg="blue.500" color="white" fontSize="9px">Q{i + 1}</Badge>
                                <VStack align="start" gap={0.5} flex={1}>
                                  <Text fontSize="xs" fontWeight="600" color="gray.700">{q.question_text}</Text>
                                  {q.csv_image_name && (
                                    <Badge colorScheme={bulkImageFiles.some(f => f.name === q.csv_image_name) ? "green" : "red"} fontSize="9px">
                                      📸 File: {q.csv_image_name} {bulkImageFiles.some(f => f.name === q.csv_image_name) ? "(Matched)" : "(Not Uploaded Yet)"}
                                    </Badge>
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