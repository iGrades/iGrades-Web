import { Heading, Text, Flex } from "@chakra-ui/react";
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
    <>
      {videoList && selectedTopic ? (
        <VideosList
          topic={selectedTopic}
          videos={videos.filter((vid) => vid.topic_id === selectedTopic.id)}
          onBack={handleBackFromVideos}
        />
      ) : (
        <>
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
                      {numVideos} video{numVideos !== 1 ? "s" : ""}
                    </Text>
                  </Flex>
                </Flex>
              );
            })
          )}
        </>
      )}
    </>
  );
};

export default TopicsList;
