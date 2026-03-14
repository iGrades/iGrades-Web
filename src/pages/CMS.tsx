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
  RadioCard,
  Alert,
  Badge,
  IconButton,
  Tabs,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { FiFile, FiX, FiPlus, FiTrash2, FiDownload, FiUpload, FiImage } from "react-icons/fi";
import { IoCloudUploadOutline } from "react-icons/io5";
import { MdQuiz } from "react-icons/md";
import { HiOutlineDocumentArrowUp } from "react-icons/hi2";
import * as XLSX from "xlsx";
import { supabase } from "@/lib/supabaseClient";

interface Class { id: string; name: string }
interface Subject { id: string; name: string }
interface Topic { id: string; name: string; description: string; class_id: string; subject_id: string }
interface Quiz { id: string; subject_id: string; topic_id: string; class_id: string }
interface QuizQuestion {
  question_text: string;
  option_a: string; option_b: string; option_c: string; option_d: string;
  correct_option: "a" | "b" | "c" | "d" | "";
  image_file?: File | null;
  image_preview?: string | null;
}

const emptyQuestion = (): QuizQuestion => ({
  question_text: "", option_a: "", option_b: "", option_c: "", option_d: "",
  correct_option: "", image_file: null, image_preview: null,
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
  const [uploadValue, setUploadValue] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedClass, setSelectedClass] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [quizClasses, setQuizClasses] = useState<Class[]>([]);
  const [quizSelectedClass, setQuizSelectedClass] = useState<string[]>([]);
  const [quizSubjects, setQuizSubjects] = useState<Subject[]>([]);
  const [quizTopics, setQuizTopics] = useState<Topic[]>([]);
  const [quizSelectedSubject, setQuizSelectedSubject] = useState<string[]>([]);
  const [quizSelectedTopic, setQuizSelectedTopic] = useState<string[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([emptyQuestion()]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizSelectedQuiz, setQuizSelectedQuiz] = useState<string[]>([]);

  const [importedQuestions, setImportedQuestions] = useState<QuizQuestion[]>([]);
  const [importFileName, setImportFileName] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchClasses(); fetchSubjects(); }, []);

  useEffect(() => {
    if (selectedClass.length > 0 && selectedSubject.length > 0) {
      fetchTopics(selectedClass[0], selectedSubject[0]);
    } else { setTopics([]); setSelectedTopic([]); }
  }, [selectedClass, selectedSubject]);

  useEffect(() => {
    if (quizSelectedSubject.length > 0) fetchQuizTopics(quizSelectedSubject[0]);
    else { setQuizTopics([]); setQuizSelectedTopic([]); }
    setQuizzes([]); setQuizSelectedQuiz([]);
  }, [quizSelectedSubject]);

  useEffect(() => {
    setQuizSelectedClass([]);
  }, [quizSelectedSubject, quizSelectedTopic]);

  useEffect(() => {
    if (quizSelectedSubject.length > 0 && quizSelectedTopic.length > 0) {
      fetchQuizzes(quizSelectedSubject[0], quizSelectedTopic[0]);
    } else { setQuizzes([]); setQuizSelectedQuiz([]); }
  }, [quizSelectedSubject, quizSelectedTopic]);

  useEffect(() => {
    if (alert) { const t = setTimeout(() => setAlert(null), 4500); return () => clearTimeout(t); }
  }, [alert]);

  const fetchClasses = async () => {
    const { data } = await supabase.from("classes").select("id, name").order("name");
    setClasses(data || []); setQuizClasses(data || []);
  };
  const fetchSubjects = async () => {
    const { data } = await supabase.from("subjects").select("id, name").order("name");
    setSubjects(data || []); setQuizSubjects(data || []);
  };
  const fetchTopics = async (classId: string, subjectId: string) => {
    const { data } = await supabase.from("topics")
      .select("id, name, description, class_id, subject_id")
      .eq("class_id", classId).eq("subject_id", subjectId).order("name");
    setTopics(data || []);
  };
  const fetchQuizTopics = async (subjectId: string) => {
    const { data } = await supabase.from("topics")
      .select("id, name, description, class_id, subject_id")
      .eq("subject_id", subjectId).order("name");
    setQuizTopics(data || []);
  };

  const fetchQuizzes = async (subjectId: string, topicId: string) => {
    const { data } = await supabase
      .from("quizzes")
      .select("id, subject_id, topic_id, class_id")
      .eq("subject_id", subjectId)
      .eq("topic_id", topicId)
      .order("title");
    setQuizzes(data || []);
  };

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

  const handleUpload = async () => {
    if (!files.length || !selectedClass[0] || !selectedSubject[0] || !selectedTopic[0] || !fileType[0] || !title) {
      setAlert({ type: "error", message: "Please fill all required fields" }); return;
    }
    setLoading(true);
    try {
      const fileUrl = await uploadFileToSupabase(files[0], fileType[0]);
      const { error } = await supabase.from("resources").insert([{
        class_id: selectedClass[0], subject_id: selectedSubject[0], topic_id: selectedTopic[0],
        title, description, type: fileType[0], duration: 0, order_index: 0, url: fileUrl,
      }]).select();
      if (error) throw error;
      setAlert({ type: "success", message: "File uploaded successfully!" });
      setFiles([]); setFileType([]); setSelectedClass([]); setSelectedSubject([]);
      setSelectedTopic([]); setTitle(""); setDescription(""); setUploadValue(undefined);
    } catch (err) {
      setAlert({ type: "error", message: "Upload failed: " + (err as Error).message });
    } finally { setLoading(false); }
  };

  const updateQuestion = (i: number, f: keyof QuizQuestion, v: string) =>
    setQuestions((p) => p.map((q, j) => j === i ? { ...q, [f]: v } : q));

  const updateQuestionImage = (i: number, file: File | null) => {
    if (!file) {
      setQuestions((p) => p.map((q, j) => j === i ? { ...q, image_file: null, image_preview: null } : q));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setQuestions((p) =>
        p.map((q, j) =>
          j === i ? { ...q, image_file: file, image_preview: e.target?.result as string } : q
        )
      );
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
    // If user picked an existing quiz, use it directly
    if (quizSelectedQuiz[0] && quizSelectedQuiz[0] !== "__new__") return quizSelectedQuiz[0];

    // Otherwise create a new one
    if (!quizSelectedClass[0]) {
      setAlert({ type: "error", message: "Please select a class for the new quiz." });
      return null;
    }
    const { data, error } = await supabase
      .from("quizzes")
      .insert({
        class_id: quizSelectedClass[0],
        subject_id: quizSelectedSubject[0],
        topic_id: quizSelectedTopic[0],
      })
      .select("id")
      .single();
    if (error) { setAlert({ type: "error", message: "Failed to create quiz: " + error.message }); return null; }
    // Refresh quiz list and mark the new quiz as selected
    await fetchQuizzes(quizSelectedSubject[0], quizSelectedTopic[0]);
    setQuizSelectedQuiz([data.id]);
    return data.id;
  };

  const handleQuizUpload = async () => {
    if (!quizSelectedSubject[0] || !quizSelectedTopic[0]) {
      setAlert({ type: "error", message: "Please select a subject and topic." }); return;
    }
    if (questions.some((q) => !isQuestionValid(q))) {
      setAlert({ type: "error", message: "Fill all fields for every question." }); return;
    }
    setQuizLoading(true);
    try {
      const quizId = await createOrGetQuiz();
      if (!quizId) { setQuizLoading(false); return; }

      // Upload any attached images first, then build DB rows
      const rows = await Promise.all(
        questions.map(async (q) => {
          let image_url: string | null = null;
          if (q.image_file) image_url = await uploadQuestionImage(q.image_file);
          const { /*image_file, image_preview,  */ ...rest } = q;
          return {
            ...rest, image_url,
            subject_id: quizSelectedSubject[0],
            topic_id: quizSelectedTopic[0],
            quiz_id: quizId,
          };
        })
      );
      const { error } = await supabase.from("questions").insert(rows);
      if (error) throw error;
      setAlert({ type: "success", message: `${rows.length} question${rows.length > 1 ? "s" : ""} uploaded!` });
      setQuestions([emptyQuestion()]); setQuizSelectedSubject([]); setQuizSelectedTopic([]); setQuizSelectedQuiz([]); setQuizSelectedClass([]);
    } catch (err) {
      setAlert({ type: "error", message: "Upload failed: " + (err as Error).message });
    } finally { setQuizLoading(false); }
  };

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
        if (!rows.length) { setImportError("File is empty."); return; }
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
          });
        });
        if (errs.length) {
          setImportError(errs.slice(0, 3).join(" · ") + (errs.length > 3 ? ` +${errs.length - 3} more` : "")); return;
        }
        setImportedQuestions(parsed);
      } catch { setImportError("Could not parse file. Please use the template."); }
    };
    reader.readAsArrayBuffer(file);
  };

  const downloadCsvTemplate = () => {
    const headers = ["question_text", "option_a", "option_b", "option_c", "option_d", "correct_option"];
    const examples = [
      ["What is 2 + 2?", "3", "4", "5", "6", "B"],
      ["What is the capital of France?", "Berlin", "Madrid", "Paris", "Rome", "C"],
    ];
    const csvRows = [
      headers.join(","),
      ...examples.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "quiz_questions_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileImportUpload = async () => {
    if (!quizSelectedSubject[0] || !quizSelectedTopic[0]) {
      setAlert({ type: "error", message: "Select a subject and topic first." }); return;
    }
    setQuizLoading(true);
    try {
      const quizId = await createOrGetQuiz();
      if (!quizId) { setQuizLoading(false); return; }

      const rows = importedQuestions.map((q) => ({
        ...q,
        subject_id: quizSelectedSubject[0],
        topic_id: quizSelectedTopic[0],
        quiz_id: quizId,
      }));
      const { error } = await supabase.from("questions").insert(rows);
      if (error) throw error;
      setAlert({ type: "success", message: `${rows.length} question${rows.length > 1 ? "s" : ""} uploaded!` });
      setImportedQuestions([]); setImportFileName(null); setQuizSelectedSubject([]); setQuizSelectedTopic([]); setQuizSelectedQuiz([]); setQuizSelectedClass([]);
    } catch (err) {
      setAlert({ type: "error", message: "Upload failed: " + (err as Error).message });
    } finally { setQuizLoading(false); }
  };

  const classCollection = createListCollection<SelectItem>({ items: classes.map((c) => ({ label: c.name, value: c.id })) });
  const subjectCollection = createListCollection<SelectItem>({ items: subjects.map((s) => ({ label: s.name, value: s.id })) });
  const topicCollection = createListCollection<SelectItem>({ items: topics.map((t) => ({ label: t.name, value: t.id })) });
  const fileTypeCollection = createListCollection<SelectItem>({ items: [{ label: "PDF", value: "pdf" }, { label: "Video", value: "video" }, { label: "Past Questions", value: "pqs" }] });
  const quizSubjectCollection = createListCollection<SelectItem>({ items: quizSubjects.map((s) => ({ label: s.name, value: s.id })) });
  const quizTopicCollection = createListCollection<SelectItem>({ items: quizTopics.map((t) => ({ label: t.name, value: t.id })) });
  const quizClassCollection = createListCollection<SelectItem>({ items: quizClasses.map((c) => ({ label: c.name, value: c.id })) });
  // const quizCollection = createListCollection({
  //   items: quizzes.map((q) => ({ label: q.title, value: q.id })),
  // });
  const correctOptionCollection = createListCollection<SelectItem>({ items: [{ label: "Option A", value: "a" }, { label: "Option B", value: "b" }, { label: "Option C", value: "c" }, { label: "Option D", value: "d" }] });

  const quizUploadDisabled = !quizSelectedSubject[0] || !quizSelectedTopic[0] || questions.some((q) => !isQuestionValid(q)) || quizLoading;

  return (
    <Box
      minH="100vh"
      bg="gray.50"
      backgroundImage="radial-gradient(circle, #e2e8f0 1px, transparent 1px)"
      backgroundSize="22px 22px"
      p={{ base: 4, md: 8 }}
      position="relative"
    >
      {/* Ambient glow */}
      <Box position="fixed" top="-15%" left="-8%" w="500px" h="500px" borderRadius="full"
        bg="blue.100" opacity={0.4} filter="blur(100px)" pointerEvents="none" zIndex={0} />
      <Box position="fixed" bottom="-15%" right="-8%" w="440px" h="440px" borderRadius="full"
        bg="primaryColor" opacity={0.07} filter="blur(110px)" pointerEvents="none" zIndex={0} />

      {/* Slide-in toast */}
      {alert && (
        <Box position="fixed" top={5} right={5} w={{ base: "90vw", sm: "340px" }} zIndex={50}
          style={{ animation: "slideIn 0.22s cubic-bezier(.16,1,.3,1)" }}>
          <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(-10px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>
          <Alert.Root status={alert.type} variant="subtle" borderRadius="xl"
            boxShadow="0 8px 30px rgba(0,0,0,0.12)" border="1px solid"
            borderColor={alert.type === "error" ? "red.200" : "green.200"}>
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title fontSize="sm">{alert.type === "error" ? "Error" : "Done!"}</Alert.Title>
              <Alert.Description fontSize="xs">{alert.message}</Alert.Description>
            </Alert.Content>
          </Alert.Root>
        </Box>
      )}

      <Box position="relative" zIndex={1} maxW="1360px" mx="auto">

        {/* Page header */}
        <Box mb={8}>
          <HStack gap={3} mb={1} align="center">
            <Box w="4px" h={9} bg="primaryColor" borderRadius="full" flexShrink={0} />
            <Box>
              <Heading fontSize={{ base: "2xl", md: "28px" }} fontWeight="800" color="gray.900" letterSpacing="-0.025em" lineHeight="1">
                Content Management
              </Heading>
              <Text fontSize="sm" color="gray.400" mt={1}>
                Upload academic resources and quiz questions for students
              </Text>
            </Box>
          </HStack>
        </Box>

        {/* Two-column grid */}
        <Grid templateColumns={{ base: "1fr", xl: "1fr 1fr" }} gap={6} alignItems="start">

          {/* ══ LEFT — Resources ══ */}
          <GridItem>
            <SectionCard
              icon={HiOutlineDocumentArrowUp}
              title="Academic Resources"
              subtitle="PDFs, videos & past questions"
              accentColor="blue.500"
            >
              <VStack gap={4} align="stretch">

                <Box>
                  <Text {...fieldLabelProps}>Resource Title</Text>
                  <Input placeholder="e.g. Introduction to Algebra" value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    bg="gray.50" border="1px solid" borderColor="gray.200" borderRadius="lg"
                    _focus={{ borderColor: "blue.400", bg: "white" }}
                    _hover={{ borderColor: "gray.300" }}
                    transition="all 0.15s" variant="subtle" px={3} h={10} fontSize="sm" />
                </Box>

                <Grid templateColumns="1fr 1fr" gap={3}>
                  <StyledSelect collection={classCollection} value={selectedClass}
                    onValueChange={(e) => setSelectedClass(e.value)} label="Class" placeholder="Select class" />
                  <StyledSelect collection={subjectCollection} value={selectedSubject}
                    onValueChange={(e) => setSelectedSubject(e.value)} label="Subject" placeholder="Select subject" />
                </Grid>

                <StyledSelect collection={topicCollection} value={selectedTopic}
                  onValueChange={(e) => setSelectedTopic(e.value)} label="Topic"
                  placeholder={!selectedClass[0] || !selectedSubject[0] ? "Select class & subject first" : topics.length === 0 ? "No topics found" : "Select topic"}
                  disabled={!selectedClass[0] || !selectedSubject[0]} />

                <StyledSelect collection={fileTypeCollection} value={fileType}
                  onValueChange={(e) => setFileType(e.value)} label="File Type" placeholder="Select type" />

                <Box>
                  <Text {...fieldLabelProps}>Description</Text>
                  <Textarea placeholder="Brief description (optional)" value={description}
                    onChange={(e) => setDescription(e.target.value)} rows={3}
                    bg="gray.50" border="1px solid" borderColor="gray.200" borderRadius="lg"
                    _focus={{ borderColor: "blue.400", bg: "white" }}
                    _hover={{ borderColor: "gray.300" }}
                    transition="all 0.15s" variant="subtle" px={3} pt={2} resize="none" fontSize="sm" />
                </Box>

                {/* Drop zone */}
                <Box>
                  <Text {...fieldLabelProps}>Upload File</Text>
                  <Box {...getRootProps()}
                    border="2px dashed" borderColor={isDragActive ? "blue.400" : "gray.200"}
                    borderRadius="xl" p={5} textAlign="center" cursor="pointer"
                    transition="all 0.2s" bg={isDragActive ? "blue.50" : "gray.50"}
                    _hover={{ borderColor: "blue.300", bg: "blue.50" }}>
                    <Box mb={2}>
                      <RadioCard.Root value={uploadValue}
                        onValueChange={(val: any) => setUploadValue(val?.value ?? val)}
                        border="1px solid" borderColor="transparent">
                        <RadioCard.Item value="upload_resources">
                          <RadioCard.ItemHiddenInput />
                          <RadioCard.ItemControl>
                            <RadioCard.ItemText fontSize="xs">Upload Academic Resources</RadioCard.ItemText>
                            <RadioCard.ItemIndicator />
                          </RadioCard.ItemControl>
                        </RadioCard.Item>
                      </RadioCard.Root>
                    </Box>
                    <input {...getInputProps()} />
                    <VStack gap={1.5}>
                      <Box bg="blue.50" p={2.5} borderRadius="xl" display="inline-flex">
                        <Icon as={IoCloudUploadOutline} boxSize={5} color="blue.400" />
                      </Box>
                      <Text fontSize="xs" color="gray.400" fontWeight="500">
                        {isDragActive ? "Drop it here…" : "Drag & drop or tap to browse"}
                      </Text>
                    </VStack>
                  </Box>
                </Box>

                {/* File chip */}
                {files.length > 0 && files.map((file, i) => (
                  <HStack key={i} p={3} bg="blue.50" borderRadius="xl" border="1px solid" borderColor="blue.100" justify="space-between">
                    <HStack gap={2.5}>
                      <Box bg="blue.100" p={1.5} borderRadius="md" flexShrink={0}>
                        <Icon as={FiFile} color="blue.600" boxSize={3.5} />
                      </Box>
                      <VStack align="start" gap={0}>
                        <Text fontSize="xs" fontWeight="600" color="gray.700" maxW="200px" >{file.name}</Text>
                        <Text fontSize="10px" color="gray.400">{(file.size / 1024 / 1024).toFixed(2)} MB</Text>
                      </VStack>
                    </HStack>
                    <IconButton aria-label="Remove" size="xs" variant="ghost" colorScheme="red" onClick={() => removeFile(i)}>
                      <Icon as={FiX} boxSize={3} />
                    </IconButton>
                  </HStack>
                ))}

                <Button bg="primaryColor" color="white" rounded="xl" size="md" h={11} onClick={handleUpload}
                  disabled={!files.length || !selectedClass[0] || !selectedSubject[0] || !selectedTopic[0] || !fileType[0] || !title || loading}
                  loading={loading} loadingText="Uploading…"
                  fontWeight="600" fontSize="sm" letterSpacing="0.01em"
                  _hover={{ opacity: 0.88, transform: "translateY(-1px)", boxShadow: "0 4px 14px rgba(0,0,0,0.15)" }}
                  _active={{ transform: "translateY(0)", boxShadow: "none" }}
                  transition="all 0.15s" boxShadow="0 2px 6px rgba(0,0,0,0.1)">
                  Upload Resource
                </Button>
              </VStack>
            </SectionCard>
          </GridItem>

          {/* ══ RIGHT — Quiz Questions ══ */}
          <GridItem>
            <SectionCard
              icon={MdQuiz}
              title="Quiz Questions"
              subtitle="Per subject & topic"
              accentColor="primaryColor"
            >
              <VStack gap={4} align="stretch">

                <Grid templateColumns="1fr 1fr" gap={3}>
                  <StyledSelect collection={quizSubjectCollection} value={quizSelectedSubject}
                    onValueChange={(e) => setQuizSelectedSubject(e.value)} label="Subject" placeholder="Select subject" />
                  <StyledSelect collection={quizTopicCollection} value={quizSelectedTopic}
                    onValueChange={(e) => setQuizSelectedTopic(e.value)} label="Topic"
                    placeholder={!quizSelectedSubject[0] ? "Subject first" : quizTopics.length === 0 ? "No topics" : "Select topic"}
                    disabled={!quizSelectedSubject[0]} />
                </Grid>

                {/* ── Quiz selector / creator ── */}
                <Box>
                  <Text {...fieldLabelProps}>Quiz</Text>
                  {!quizSelectedSubject[0] || !quizSelectedTopic[0] ? (
                    <Box px={3} py={2} bg="gray.50" borderRadius="lg" border="1px solid" borderColor="gray.200">
                      <Text fontSize="xs" color="gray.400">Select subject &amp; topic first</Text>
                    </Box>
                  ) : quizzes.length === 0 ? (
                    /* No quizzes exist — straight to create mode */
                    <Box p={3} bg="orange.50" border="1px solid" borderColor="orange.200" borderRadius="lg">
                      <Text fontSize="xs" color="orange.700" fontWeight="600" mb={2}>
                        No quiz exists for this subject/topic — a new one will be created.
                      </Text>
                      <StyledSelect
                        collection={quizClassCollection}
                        value={quizSelectedClass}
                        onValueChange={(e) => setQuizSelectedClass(e.value)}
                        label="Assign to Class"
                        placeholder="Select class"
                      />
                    </Box>
                  ) : (
                    /* Quizzes exist — pick one or choose to create a new one */
                    <Box>
                      <StyledSelect
                        collection={createListCollection({
                          items: [
                            ...quizzes.map((q, i) => ({ label: `Quiz ${i + 1} (existing)`, value: q.id })),
                            { label: "＋ Create new quiz", value: "__new__" },
                          ],
                        })}
                        value={quizSelectedQuiz}
                        onValueChange={(e) => { setQuizSelectedQuiz(e.value); setQuizSelectedClass([]); }}
                        label="Select or create quiz"
                        placeholder="Choose…"
                      />
                      {quizSelectedQuiz[0] === "__new__" && (
                        <Box mt={2} p={3} bg="blue.50" border="1px solid" borderColor="blue.200" borderRadius="lg">
                          <Text fontSize="xs" color="blue.700" fontWeight="600" mb={2}>
                            Select the class for the new quiz
                          </Text>
                          <StyledSelect
                            collection={quizClassCollection}
                            value={quizSelectedClass}
                            onValueChange={(e) => setQuizSelectedClass(e.value)}
                            label="Class"
                            placeholder="Select class"
                          />
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>

                <Tabs.Root defaultValue="manual" variant="enclosed" size="sm">
                  <Tabs.List bg="gray.100" borderRadius="lg" p={0.5} gap={0.5}>
                    <Tabs.Trigger value="manual" flex={1} borderRadius="md" fontSize="xs" fontWeight="600"
                      _selected={{ bg: "white", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", color: "gray.800" }}
                      color="gray.400" transition="all 0.15s">
                      ✏️&nbsp; Manual Entry
                    </Tabs.Trigger>
                    <Tabs.Trigger value="import" flex={1} borderRadius="md" fontSize="xs" fontWeight="600"
                      _selected={{ bg: "white", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", color: "gray.800" }}
                      color="gray.400" transition="all 0.15s">
                      <Icon as={FiUpload} mr={1.5} boxSize={3} />
                      Import File
                    </Tabs.Trigger>
                  </Tabs.List>

                  {/* Manual */}
                  <Tabs.Content value="manual" pt={4}>
                    <VStack gap={3} align="stretch">
                      <Box maxH="500px" overflowY="auto" pr={0.5}>
                        <VStack gap={3} align="stretch">
                          {questions.map((q, index) => (
                            <Box key={index} border="1px solid" borderColor="gray.100"
                              borderRadius="xl" p={4} bg="gray.50" position="relative" overflow="hidden">
                              <Box position="absolute" left={0} top={0} bottom={0} w="3px" bg="primaryColor" />
                              <HStack justify="space-between" mb={3} pl={3}>
                                <Badge bg="primaryColor" color="white" fontSize="9px"
                                  fontWeight="800" px={2} py={0.5} borderRadius="md" letterSpacing="0.04em">
                                  Q{index + 1}
                                </Badge>
                                <IconButton aria-label="Remove" size="xs" variant="ghost" colorScheme="red"
                                  disabled={questions.length === 1} onClick={() => removeQuestion(index)}>
                                  <Icon as={FiTrash2} boxSize={3} />
                                </IconButton>
                              </HStack>

                              <VStack gap={2.5} align="stretch" pl={3}>
                                <Textarea placeholder="Question text…" value={q.question_text}
                                  onChange={(e) => updateQuestion(index, "question_text", e.target.value)}
                                  rows={2} bg="white" border="1px solid" borderColor="gray.200" borderRadius="lg"
                                  _focus={{ borderColor: "blue.400", bg: "white" }}
                                  variant="subtle" px={3} pt={2} resize="none" fontSize="sm" />

                                {/* ── Question image (optional) ── */}
                                <Box>
                                  {q.image_preview ? (
                                    <Box position="relative" display="inline-block">
                                      <img
                                        src={q.image_preview!}
                                        alt="Question image preview"
                                        style={{
                                          maxHeight: "140px", maxWidth: "100%",
                                          borderRadius: "8px", border: "1px solid #E2E8F0",
                                          display: "block",
                                        }}
                                      />
                                      <IconButton
                                        aria-label="Remove image"
                                        size="xs"
                                        position="absolute"
                                        top={1}
                                        right={1}
                                        bg="red.500"
                                        color="white"
                                        borderRadius="full"
                                        _hover={{ bg: "red.600" }}
                                        onClick={() => updateQuestionImage(index, null)}
                                      >
                                        <Icon as={FiX} boxSize={2.5} />
                                      </IconButton>
                                    </Box>
                                  ) : (
                                    <label
                                      htmlFor={"q-img-" + index}
                                      style={{
                                        display: "flex", alignItems: "center", gap: "8px",
                                        padding: "6px 12px", background: "white",
                                        border: "1px dashed #CBD5E0", borderRadius: "8px",
                                        cursor: "pointer", width: "fit-content", transition: "all 0.15s",
                                      }}
                                      onMouseEnter={(e) => {
                                        (e.currentTarget as HTMLElement).style.borderColor = "#90CDF4";
                                        (e.currentTarget as HTMLElement).style.background = "#EBF8FF";
                                      }}
                                      onMouseLeave={(e) => {
                                        (e.currentTarget as HTMLElement).style.borderColor = "#CBD5E0";
                                        (e.currentTarget as HTMLElement).style.background = "white";
                                      }}
                                    >
                                      <input
                                        id={"q-img-" + index}
                                        type="file"
                                        accept="image/*"
                                        style={{ display: "none" }}
                                        onChange={(e) => {
                                          const f = e.target.files?.[0] ?? null;
                                          updateQuestionImage(index, f);
                                          e.target.value = "";
                                        }}
                                      />
                                      <Icon as={FiImage} boxSize={3} color="gray.400" />
                                      <Text fontSize="10px" color="gray.400" fontWeight="500">
                                        Add image (optional)
                                      </Text>
                                    </label>
                                  )}
                                </Box>

                                <Grid templateColumns="1fr 1fr" gap={2}>
                                  {(["a", "b", "c", "d"] as const).map((opt) => (
                                    <HStack key={opt} bg="white" border="1px solid" borderColor="gray.200"
                                      borderRadius="lg" px={2.5} gap={1.5} h={9}>
                                      <Text fontSize="10px" fontWeight="800" color="gray.300"
                                        textTransform="uppercase" minW="14px" textAlign="center"
                                        flexShrink={0}>{opt}</Text>
                                      <Input placeholder={`Option ${opt.toUpperCase()}`}
                                        value={q[`option_${opt}` as keyof QuizQuestion] as string}
                                        onChange={(e) => updateQuestion(index, `option_${opt}` as keyof QuizQuestion, e.target.value)}
                                        variant="subtle" fontSize="xs" h="full" />
                                    </HStack>
                                  ))}
                                </Grid>

                                <StyledSelect collection={correctOptionCollection}
                                  value={q.correct_option ? [q.correct_option] : []}
                                  onValueChange={(e) => updateQuestion(index, "correct_option", e.value[0] ?? "")}
                                  label="Correct Answer" placeholder="Select correct option" size="sm" />
                              </VStack>
                            </Box>
                          ))}
                        </VStack>
                      </Box>

                      <Button variant="outline" size="sm" h={9} onClick={addQuestion}
                        borderStyle="dashed" borderColor="blue.300" color="blue.500" borderRadius="lg"
                        _hover={{ bg: "blue.50", borderColor: "blue.400" }} fontSize="xs" fontWeight="600" transition="all 0.15s">
                        <Icon as={FiPlus} mr={1.5} boxSize={3} />
                        Add Question
                      </Button>

                      <Button bg="primaryColor" color="white" rounded="xl" size="md" h={11} onClick={handleQuizUpload}
                        disabled={quizUploadDisabled} loading={quizLoading} loadingText="Uploading…"
                        fontWeight="600" fontSize="sm"
                        _hover={{ opacity: 0.88, transform: "translateY(-1px)", boxShadow: "0 4px 14px rgba(0,0,0,0.15)" }}
                        _active={{ transform: "translateY(0)" }}
                        transition="all 0.15s" boxShadow="0 2px 6px rgba(0,0,0,0.1)">
                        Upload {questions.length} Question{questions.length > 1 ? "s" : ""}
                      </Button>
                    </VStack>
                  </Tabs.Content>

                  {/* Import */}
                  <Tabs.Content value="import" pt={4}>
                    <VStack gap={4} align="stretch">

                      {/* Template banner */}
                      <HStack bg="blue.50" border="1px solid" borderColor="blue.100"
                        borderRadius="xl" p={3.5} justify="space-between">
                        <VStack align="start" gap={0.5}>
                          <Text fontSize="xs" fontWeight="700" color="blue.800">Download Template</Text>
                          <Text fontSize="xs" color="blue.500" lineHeight="1.4">CSV · Fill in and upload below</Text>
                        </VStack>
                        <Button onClick={downloadCsvTemplate}
                          size="sm" bg="blue.500" color="white" borderRadius="lg"
                          _hover={{ bg: "blue.600", transform: "translateY(-1px)" }}
                          transition="all 0.15s" flexShrink={0} fontSize="xs" fontWeight="600">
                          <Icon as={FiDownload} mr={1.5} />
                          Template (.csv)
                        </Button>
                      </HStack>

                      {/* File picker */}
                      <label htmlFor="quiz-file-input" style={{
                        display: "block", border: "2px dashed",
                        borderColor: importedQuestions.length > 0 ? "#68D391" : "#E2E8F0",
                        borderRadius: "12px", padding: "20px", textAlign: "center", cursor: "pointer",
                        background: importedQuestions.length > 0 ? "#F0FFF4" : "#F7FAFC",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor = "#90CDF4";
                        (e.currentTarget as HTMLElement).style.background = "#EBF8FF";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor = importedQuestions.length > 0 ? "#68D391" : "#E2E8F0";
                        (e.currentTarget as HTMLElement).style.background = importedQuestions.length > 0 ? "#F0FFF4" : "#F7FAFC";
                      }}>
                        <input id="quiz-file-input" ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv"
                          style={{ display: "none" }}
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) parseImportFile(f); e.target.value = ""; }} />
                        <VStack gap={1.5}>
                          <Box bg={importedQuestions.length > 0 ? "green.100" : "blue.50"} p={2.5} borderRadius="xl" display="inline-flex">
                            <Icon as={importedQuestions.length > 0 ? FiFile : IoCloudUploadOutline} boxSize={5}
                              color={importedQuestions.length > 0 ? "green.500" : "blue.400"} />
                          </Box>
                          <Text fontSize="xs" color="gray.400" fontWeight="500">
                            {importFileName || ".xlsx, .xls or .csv"}
                          </Text>
                          {importedQuestions.length > 0 && (
                            <Badge colorScheme="green" variant="subtle" borderRadius="md" fontSize="xs">
                              {importedQuestions.length} questions ready
                            </Badge>
                          )}
                        </VStack>
                      </label>

                      {importError && (
                        <Alert.Root status="error" variant="subtle" borderRadius="xl">
                          <Alert.Indicator />
                          <Alert.Content>
                            <Alert.Title fontSize="xs">Invalid file</Alert.Title>
                            <Alert.Description fontSize="xs">{importError}</Alert.Description>
                          </Alert.Content>
                        </Alert.Root>
                      )}

                      {importedQuestions.length > 0 && (
                        <Box>
                          <HStack justify="space-between" mb={2}>
                            <Text {...fieldLabelProps} mb={0}>Preview</Text>
                            <Badge colorScheme="green" variant="subtle" borderRadius="md" fontSize="xs">
                              {importedQuestions.length} found
                            </Badge>
                          </HStack>
                          <VStack gap={2} align="stretch" maxH="240px" overflowY="auto" pr={0.5}>
                            {importedQuestions.map((q, i) => (
                              <HStack key={i} p={3} bg="white" border="1px solid" borderColor="gray.100"
                                borderRadius="lg" align="start" gap={2.5}>
                                <Badge bg="primaryColor" color="white" fontSize="9px" fontWeight="800"
                                  px={1.5} py={0.5} borderRadius="md" flexShrink={0}>
                                  Q{i + 1}
                                </Badge>
                                <VStack align="start" gap={0.5} flex={1} minW={0}>
                                  <Text fontSize="xs" fontWeight="600" color="gray.700">{q.question_text}</Text>
                                  <HStack gap={2} flexWrap="wrap">
                                    {(["a", "b", "c", "d"] as const).map((opt) => (
                                      <Text key={opt} fontSize="10px"
                                        color={q.correct_option === opt.toUpperCase() ? "green.600" : "gray.400"}
                                        fontWeight={q.correct_option === opt.toUpperCase() ? "700" : "400"}>
                                        {opt.toUpperCase()}: {q[`option_${opt}` as keyof QuizQuestion] as string}
                                        {q.correct_option === opt.toUpperCase() && " ✓"}
                                      </Text>
                                    ))}
                                  </HStack>
                                </VStack>
                              </HStack>
                            ))}
                          </VStack>
                        </Box>
                      )}

                      <Button bg="primaryColor" color="white" rounded="xl" size="md" h={11} onClick={handleFileImportUpload}
                        disabled={!importedQuestions.length || !quizSelectedSubject[0] || !quizSelectedTopic[0] || quizLoading}
                        loading={quizLoading} loadingText="Uploading…"
                        fontWeight="600" fontSize="sm"
                        _hover={{ opacity: 0.88, transform: "translateY(-1px)", boxShadow: "0 4px 14px rgba(0,0,0,0.15)" }}
                        _active={{ transform: "translateY(0)" }}
                        transition="all 0.15s" boxShadow="0 2px 6px rgba(0,0,0,0.1)">
                        Upload {importedQuestions.length > 0 ? `${importedQuestions.length} ` : ""}
                        Question{importedQuestions.length !== 1 ? "s" : ""}
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