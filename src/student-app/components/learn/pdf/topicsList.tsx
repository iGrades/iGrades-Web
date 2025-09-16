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
    <Box bg="white" rounded="lg" shadow="lg" p={4} mb={20} h="75vh">
      {pdfList && selectedTopic ? (
        <PdfList
          topic={selectedTopic}
          pdf={PDFs.filter((vid) => vid.topic_id === selectedTopic.id)}
          onBack={handleBackFromPdfs}
        />
      ) : (
        <>
          {/* Header with back button */}
          <Heading
            as="h3"
            display="flex"
            alignItems="center"
            justifyContent="flex-start"
            gap={3}
            mt={3}
            mb={5}
            mx={2}
            cursor="pointer"
          >
            <LuArrowLeft onClick={handleBackToSubjects} />
            {courseName} Topics
          </Heading>

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
                  direction={"column"}
                  justify="space-around"
                  gap={4}
                  p={3}
                >
                  <Flex
                    justify="space-between"
                    p={6}
                    borderRadius="md"
                    _hover={{ bg: "gray.100", transform: "translateX(4px)" }}
                    cursor="pointer"
                    bg={"textFieldColor"}
                    transition="all 0.2s"
                    onClick={() => handleTopicClick(topic)}
                  >
                    <Text fontSize="sm" fontWeight="bold">
                      {topic.name}
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      {numPdfs} file{numPdfs !== 1 ? "s" : ""}
                    </Text>
                  </Flex>
                </Flex>
              );
            })
          )}
        </>
      )}
    </Box>
  );
};

export default TopicsList;
