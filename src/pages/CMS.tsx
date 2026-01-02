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
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { FiFile, FiX } from "react-icons/fi";
import { IoCloudUploadOutline } from "react-icons/io5";
import { supabase } from "@/lib/supabaseClient";

interface Class {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
}

interface Topic {
  id: string;
  name: string;
  description: string;
  class_id: string;
  subject_id: string;
}

const CMS = () => {
  const [fileType, setFileType] = useState<string[]>([]);
  const [uploadValue, setUploadValue] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // New state for database selects
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedClass, setSelectedClass] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch classes and subjects on component mount
  useEffect(() => {
    fetchClasses();
    fetchSubjects();
  }, []);

  // Fetch topics when class or subject changes
  useEffect(() => {
    if (selectedClass.length > 0 && selectedSubject.length > 0) {
      fetchTopics(selectedClass[0], selectedSubject[0]);
    } else {
      setTopics([]);
      setSelectedTopic([]);
    }
  }, [selectedClass, selectedSubject]);

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from("classes")
        .select("id, name")
        .order("name");

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {}
  };

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from("subjects")
        .select("id, name")
        .order("name");

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const fetchTopics = async (classId: string, subjectId: string) => {
    try {
      const { data, error } = await supabase
        .from("topics")
        .select("id, name, description, class_id, subject_id")
        .eq("class_id", classId)
        .eq("subject_id", subjectId)
        .order("name");

      if (error) throw error;
      setTopics(data || []);
    } catch (error) {
      console.error("Error fetching topics:", error);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFiles((prev) => [...prev, ...acceptedFiles]);
    },
    multiple: false,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFileToSupabase = async (file: File, type: string) => {
    // Determine the folder based on file type
    let folder = "";
    switch (type) {
      case "pdf":
        folder = "PDFs";
        break;
      case "video":
        folder = "Videos";
        break;
      case "pqs":
        folder = "PastQuestions";
        break;
      default:
        folder = "PDFs";
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()
      .toString(36)
      .substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const {  error } = await supabase.storage
      .from("test-resource")
      .upload(filePath, file);

    if (error) {
      throw error;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("test-resource").getPublicUrl(filePath);

    return publicUrl;
  };

  const handleUpload = async () => {
    if (
      files.length === 0 ||
      !selectedClass[0] ||
      !selectedSubject[0] ||
      !selectedTopic[0] ||
      !fileType[0] ||
      !title
    ) {
      setAlert({ type: "error", message: "Please fill all required fields" });
      return;
    }

    setLoading(true);
    try {
      const file = files[0];

      // Upload file to Supabase Storage
      const fileUrl = await uploadFileToSupabase(file, fileType[0]);

      // Create resource record in the database
      const {  error } = await supabase
        .from("resources")
        .insert([
          {
            class_id: selectedClass[0],
            subject_id: selectedSubject[0],
            topic_id: selectedTopic[0],
            title: title,
            description: description,
            type: fileType[0],
            duration: 0, // will be calculated for videos
            order_index: 0, // will be calculated based on existing resources
            url: fileUrl,
          },
        ])
        .select();

      if (error) {
        throw error;
      }
      setAlert({ type: "success", message: "File uploaded successfully!" });
      

      // Clear form after successful upload
      setFiles([]);
      setFileType([]);
      setSelectedClass([]);
      setSelectedSubject([]);
      setSelectedTopic([]);
      setTitle("");
      setDescription("");
      setUploadValue(undefined);
    } catch (error) {
      console.error("Upload error:", error);
      setAlert({ type: "error", message: "Upload failed: " + (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  // Create collections for the select components
  const classCollection = createListCollection({
    items: classes.map((cls) => ({ label: cls.name, value: cls.id })),
  });

  const subjectCollection = createListCollection({
    items: subjects.map((subj) => ({ label: subj.name, value: subj.id })),
  });

  const topicCollection = createListCollection({
    items: topics.map((topic) => ({ label: topic.name, value: topic.id })),
  });

  const fileTypeCollection = createListCollection({
    items: [
      { label: "PDF", value: "pdf" },
      { label: "Video", value: "video" },
      { label: "Past Questions", value: "pqs" },
    ],
  });

  return (
    <Box maxW="2xl" mx="auto" p={6}>
         {alert && (
                <Box
                  position="absolute"
                  top={{ base: "10px", md: "20px" }}
                  right={{ base: "10px", md: "20px" }}
                  width={{ base: "90%", sm: "80%", md: "400px" }}
                  zIndex="10"
                >
                  <Alert.Root status={alert.type} variant="subtle">
                    <Alert.Indicator />
                    <Alert.Content>
                      <Alert.Title>
                        {alert.type === "error" ? "Error!" : "Success!"}
                      </Alert.Title>
                      <Alert.Description>{alert.message}</Alert.Description>
                    </Alert.Content>
                  </Alert.Root>
                </Box>
              )}
      <Heading mb={6}>CMS Upload</Heading>

      <VStack gap={6} align="stretch">
        {/* Topic Title */}
        <Box>
          <Text fontSize="sm" fontWeight="medium" mb={2}>
            Topic Title 
          </Text>
          <Input
            placeholder="Enter topic title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            variant="subtle"
          />
        </Box>

        {/* Class Select */}
        <Box>
          <Select.Root
            collection={classCollection}
            width="100%"
            variant="subtle"
            value={selectedClass}
            onValueChange={(e) => setSelectedClass(e.value)}
          >
            <Select.HiddenSelect />
            <Select.Label>Class </Select.Label>
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder="Select Class" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content>
                  {classCollection.items.map((item) => (
                    <Select.Item item={item} key={item.value}>
                      {item.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>
        </Box>

        {/* Subject Select */}
        <Box>
          <Select.Root
            collection={subjectCollection}
            width="100%"
            variant="subtle"
            value={selectedSubject}
            onValueChange={(e) => setSelectedSubject(e.value)}
          >
            <Select.HiddenSelect />
            <Select.Label>Subject </Select.Label>
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder="Select Subject" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content>
                  {subjectCollection.items.map((item) => (
                    <Select.Item item={item} key={item.value}>
                      {item.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>
        </Box>

        {/* Topic Select */}
        <Box>
          <Select.Root
            collection={topicCollection}
            width="100%"
            variant="subtle"
            value={selectedTopic}
            onValueChange={(e) => setSelectedTopic(e.value)}
            disabled={!selectedClass[0] || !selectedSubject[0]}
          >
            <Select.HiddenSelect />
            <Select.Label>Topic </Select.Label>
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText
                  placeholder={
                    !selectedClass[0] || !selectedSubject[0]
                      ? "Select Class and Subject first"
                      : topics.length === 0
                      ? "No topics found"
                      : "Select Topic"
                  }
                />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content>
                  {topicCollection.items.map((item) => (
                    <Select.Item item={item} key={item.value}>
                      {item.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>
        </Box>

        {/* File Type Select */}
        <Box>
          <Select.Root
            collection={fileTypeCollection}
            width="100%"
            variant="subtle"
            value={fileType}
            onValueChange={(e) => setFileType(e.value)}
          >
            <Select.HiddenSelect />
            <Select.Label>File Type </Select.Label>
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder="Select File Type" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content>
                  {fileTypeCollection.items.map((item) => (
                    <Select.Item item={item} key={item.value}>
                      {item.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>
        </Box>

        {/* Description */}
        <Box>
          <Text fontSize="sm" fontWeight="medium" mb={2}>
            Description
          </Text>
          <Textarea
            placeholder="Type your description here"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            variant="subtle"
          />
        </Box>

        {/* Drag and Drop Area */}
        <Box>
          <Text fontSize="sm" fontWeight="medium" mb={2}>
            Upload File 
          </Text>
          <Box
            {...getRootProps()}
            border="2px dashed"
            borderColor={"blue.400"}
            borderRadius="2xl"
            p={6}
            textAlign="center"
            cursor="pointer"
            transition="all 0.2s"
            bg={isDragActive ? "blue.50" : "white"}
          >
            {/* radio button */}
            <Box my={2} bg="white">
              <RadioCard.Root
                value={uploadValue}
                onValueChange={(val: any) => setUploadValue(val?.value ?? val)}
                border="1px solid"
                borderColor="transparent"
              >
                <RadioCard.Item value="upload_resources">
                  <RadioCard.ItemHiddenInput />
                  <RadioCard.ItemControl>
                    <RadioCard.ItemText>
                      Upload Academic Resources
                    </RadioCard.ItemText>
                    <RadioCard.ItemIndicator />
                  </RadioCard.ItemControl>
                </RadioCard.Item>
              </RadioCard.Root>
            </Box>

            <input {...getInputProps()} />
            <HStack
              gap={2}
              p={3}
              bg="textFieldColor"
              rounded="md"
              justify="center"
              fontSize={"sm"}
            >
              <Icon as={IoCloudUploadOutline} boxSize={5} color="gray.500" />
              <Text color="gray.500">
                {isDragActive ? "Drop the file here..." : "Tap to upload"}
              </Text>
            </HStack>
          </Box>
        </Box>

        {/* Selected Files List */}
        {files.length > 0 && (
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              Selected File
            </Text>
            <VStack gap={2} align="stretch">
              {files.map((file, index) => (
                <HStack
                  key={index}
                  p={3}
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="md"
                  bg="white"
                  justify="space-between"
                >
                  <HStack gap={3}>
                    <Icon as={FiFile} color="blue.500" />
                    <VStack align="start" gap={0}>
                      <Text fontSize="sm" fontWeight="medium">
                        {file.name}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </Text>
                    </VStack>
                  </HStack>
                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    onClick={() => removeFile(index)}
                  >
                    <Icon as={FiX} />
                  </Button>
                </HStack>
              ))}
            </VStack>
          </Box>
        )}

        {/* Upload Button */}
        <Button
          bg="primaryColor"
          rounded="3xl"
          size="lg"
          onClick={handleUpload}
          disabled={
            files.length === 0 ||
            !selectedClass[0] ||
            !selectedSubject[0] ||
            !selectedTopic[0] ||
            !fileType[0] ||
            !title ||
            loading
          }
          loading={loading}
          loadingText="Uploading..."
        >
          Upload
        </Button>
      </VStack>
    </Box>
  );
};

export default CMS;
