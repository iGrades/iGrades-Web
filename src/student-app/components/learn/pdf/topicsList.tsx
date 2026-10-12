import { Heading, Box, Text, Flex } from "@chakra-ui/react";
import { LuArrowLeft } from "react-icons/lu";
import { useState } from "react";
import PdfList from "./pdfsList";

interface Topic {
  id: string;
  name: string;
  description?: string;
}

interface PDFsResource {
  id: string;
  title: string;
  url: string;
  duration?: number;
  type: string;
  topic_id?: string;
  description?: string;
  file_size?: number;
}

type Props = {
  selectedCourse: string;
  courseName: string;
  topics: Topic[];
  PDFs: PDFsResource[];
  setTopicList: React.Dispatch<React.SetStateAction<boolean>>;
};

const TopicsList = ({
  setTopicList,
  topics,
  PDFs,
  courseName,
}: Props) => {
  const [pdfList, setPdfList] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  // Handle topic click
  const handleTopicClick = (topic: Topic) => {
    setSelectedTopic(topic);
    setPdfList(true);
  };

  // Handle back from pdfs to topics
  const handleBackFromPdfs = () => {
    setPdfList(false);
    setSelectedTopic(null);
  };

  // Handle back to subjects list
  const handleBackToSubjects = () => {
    setTopicList(false);
  };

  return (
    <Box h="auto">
      {pdfList && selectedTopic ? (
        <PdfList
          topic={selectedTopic}
          pdf={PDFs.filter((vid) => vid.topic_id === selectedTopic.id)}
          onBack={handleBackFromPdfs}
        />
      ) : (
        <Box w="100%">
          {/* lists of topics */}
          {topics.length === 0 ? (
            <Text fontSize="xs" color="gray.400">
              No topics available for this subject at the moment.
            </Text>
          ) : (
            topics.map((topic) => {
              const pdfsForThisTopic = PDFs.filter(
                (pdf) => pdf.topic_id === topic.id
              );
              const numPdfs = pdfsForThisTopic.length;

              return (
                <Flex
                  key={topic.id}
                  direction="column"
                  w="100%"
                  mb={2.5}
                >
                  <Flex
                    justify="space-between"
                    align="center"
                    px={4}
                    py={3.5}
                    borderRadius="xl"
                    border="1px solid"
                    borderColor="#E2E8F0"
                    boxShadow="none"
                    _hover={{ bg: "#F1F5F9" }}
                    _active={{ bg: "#E2E8F0" }}
                    cursor="pointer"
                    bg="#F8FAFC"
                    transition="all 0.15s ease"
                    onClick={() => handleTopicClick(topic)}
                    w="100%"
                  >
                    <Text fontSize="14px" fontWeight="600" color="#1E293B">
                      {topic.name}
                    </Text>
                    <Text fontSize="12px" color="#64748B" fontWeight="500">
                      {numPdfs} file{numPdfs !== 1 ? "s" : ""}
                    </Text>
                  </Flex>
                </Flex>
              );
            })
          )}
        </Box>
      )}
    </Box>
  );
};

export default TopicsList;
