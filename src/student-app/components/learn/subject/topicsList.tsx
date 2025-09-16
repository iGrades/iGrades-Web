import { Heading, Box, Text, Flex } from "@chakra-ui/react";
import { LuArrowLeft } from "react-icons/lu";
import { useState } from "react";
import VideosList from "./videosList";

interface Topic {
  id: string;
  name: string;
  description?: string;
}

interface VideoResource {
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
  videos: VideoResource[];
  setTopicList: React.Dispatch<React.SetStateAction<boolean>>;
};

const TopicsList = ({
  setTopicList,
  topics,
  videos,
  courseName,
}: Props) => {
  const [videoList, setVideoList] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  // Handle topic click
  const handleTopicClick = (topic: Topic) => {
    setSelectedTopic(topic);
    setVideoList(true);
  };

  // Handle back from videos to topics
  const handleBackFromVideos = () => {
    setVideoList(false);
    setSelectedTopic(null);
  };

  // Handle back to subjects list
  const handleBackToSubjects = () => {
    setTopicList(false);
  };

  return (
    <Box bg="white" rounded="lg" shadow="lg" p={4} mb={20} h="75vh">
      {videoList && selectedTopic ? (
        <VideosList
          topic={selectedTopic}
          videos={videos.filter((vid) => vid.topic_id === selectedTopic.id)}
          onBack={handleBackFromVideos}
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
              const videosForThisTopic = videos.filter(
                (vid) => vid.topic_id === topic.id
              );
              const numVideos = videosForThisTopic.length;

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
                      {numVideos} video{numVideos !== 1 ? "s" : ""}
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
