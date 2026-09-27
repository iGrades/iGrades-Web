"use client";

import {
  Heading,
  Grid,
  Box,
  Text,
  Dialog,
  Portal,
  CloseButton,
  Image,
  AspectRatio,
  Flex,
  HStack,
} from "@chakra-ui/react";
import { useAuthdStudentData } from "@/student-app/context/studentDataContext";
import { LuArrowLeft, LuPlay, LuLock } from "react-icons/lu";
import { useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useSubscriptionEntitlement } from "@/hooks/useSubscriptionEntitlement";
import { UpgradePromptModal } from "@/components/subscription/UpgradePromptModal";
import { LockedBadge } from "@/components/subscription/LockedBadge";

interface VideoResource {
  id: string;
  title: string;
  url: string;
  duration?: number;
  type: string;
  topic_id?: string;
}

interface Topic {
  id: string;
  name: string;
  description?: string;
}

type Props = {
  topic: Topic;
  videos: VideoResource[];
  onBack: () => void;
};

const VideosList = ({ topic, videos, onBack }: Props) => {
  const { authdStudent } = useAuthdStudentData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoResource | null>(
    null
  );
  const videoRef = useRef<HTMLVideoElement>(null);

  const {
    effectivePlan,
    verifyVideo,
    modalState,
    promptUpgrade,
    closeUpgradeModal,
  } = useSubscriptionEntitlement();

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleVideoClick = (video: VideoResource, index: number) => {
    const access = verifyVideo(index, video.title);
    if (!access.allowed) {
      promptUpgrade(
        `${video.title} Lesson`,
        access.requiredPlan,
        access.reason || "Basic plan includes 2 starter videos per topic. Upgrade to Standard (₦15,000) for full unlimited video lessons!"
      );
      return;
    }
    setSelectedVideo(video);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedVideo(null);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const getVideoUrl = (video: VideoResource) => {
    if (video.url.startsWith("http")) {
      return video.url;
    }
    if (video.url.startsWith("supabase://")) {
      const path = video.url.replace("supabase://", "");
      const { data } = supabase.storage.from("videos").getPublicUrl(path);
      return data.publicUrl;
    }
    return video.url;
  };

  const getThumbnailUrl = (video: VideoResource) => {
    const videoUrl = getVideoUrl(video);

    if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
      const videoId = videoUrl.match(
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
      );
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId[1]}/mqdefault.jpg`;
      }
    }

    return `https://placehold.co/320x180/3B82F6/white?text=${encodeURIComponent(
      video.title
    )}`;
  };

  const trackVideoProgress = async (
    videoId: string,
    progress: number,
    completed: boolean = false
  ) => {
    if (!authdStudent?.id) return;

    try {
      const { error } = await supabase.from("video_progress").upsert(
        {
          student_id: authdStudent.id,
          video_id: videoId,
          progress: progress,
          completed: completed,
          last_watched: new Date().toISOString(),
        },
        {
          onConflict: "student_id,video_id",
        }
      );

      if (error) {
        console.error("Error tracking video progress:", error);
      }
    } catch (error) {
      console.error("Error in trackVideoProgress:", error);
    }
  };

  const handleTimeUpdate = (video: VideoResource) => {
    if (!videoRef.current) return;

    const videoElement = videoRef.current;
    const progress = (videoElement.currentTime / videoElement.duration) * 100;

    if (progress % 10 === 0 || progress === 100) {
      trackVideoProgress(video.id, progress, progress === 100);
    }
  };

  return (
    <Box>
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
      >
        <LuArrowLeft onClick={onBack} style={{ cursor: "pointer" }} />
        {topic.name} Videos
      </Heading>

      {/* List of videos with thumbnails */}
      {videos.length === 0 ? (
        <Text fontSize="sm" color="gray.400" textAlign="center" mt={8}>
          No videos available for this topic yet.
        </Text>
      ) : (
        <Grid
          templateColumns="repeat(auto-fill, minmax(225px, 1fr))"
          gap={6}
          py={6}
        >
          {videos.map((video, index) => {
            const access = verifyVideo(index, video.title);
            const isLocked = !access.allowed;

            return (
              <Box
                key={video.id}
                borderRadius="lg"
                overflow="hidden"
                bg="white"
                boxShadow="sm"
                border="1px solid"
                borderColor={isLocked ? "orange.200" : "gray.200"}
                _hover={{
                  boxShadow: "md",
                  transform: "translateY(-2px)",
                }}
                transition="all 0.2s"
                cursor="pointer"
                onClick={() => handleVideoClick(video, index)}
                position="relative"
              >
                <Box>
                  {/* Video Thumbnail */}
                  <Box position="relative">
                    <AspectRatio ratio={16 / 9} width="100%">
                      <Image
                        src={getThumbnailUrl(video)}
                        alt={video.title}
                        objectFit="cover"
                        filter={isLocked ? "brightness(0.7)" : "none"}
                      />
                    </AspectRatio>

                    {/* Play or Lock button overlay */}
                    <Box
                      position="absolute"
                      top="50%"
                      left="50%"
                      transform="translate(-50%, -50%)"
                      bg={isLocked ? "blackAlpha.800" : "blackAlpha.600"}
                      borderRadius="full"
                      p={isLocked ? 3 : 2}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      {isLocked ? (
                        <LuLock size={20} color="#fbbf24" />
                      ) : (
                        <LuPlay size={24} color="white" />
                      )}
                    </Box>

                    {isLocked && (
                      <Box position="absolute" top={2} right={2}>
                        <LockedBadge requiredPlan="standard" label="Standard" size="xs" variant="solid" />
                      </Box>
                    )}
                  </Box>

                  {/* Video Info */}
                  <Box flex={1} p={4}>
                    <Text fontWeight="medium" fontSize="sm" mb={1} color={isLocked ? "gray.700" : "gray.900"}>
                      {video.title}
                    </Text>
                    {isLocked && (
                      <Text fontSize="xs" color="orange.600" fontWeight="medium">
                        Standard Plan Feature
                      </Text>
                    )}
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Grid>
      )}

      {/* ─── FIXED FULL SCREEN VIDEO DIALOG WITH NO SCROLLBAR ─── */}
      <Dialog.Root
        open={isDialogOpen}
        onOpenChange={() => setIsDialogOpen(!isDialogOpen)}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner p={0} m={0}>
            <Dialog.Content
              maxW="100vw"
              w="100vw"
              h="100vh"
              m={0}
              borderRadius={0}
              display="flex"
              flexDirection="column"
              bg="black"
              overflow="hidden"
            >
              {/* Header Box (Height is roughly 57px) */}
              <Dialog.Header
                px={6}
                py={4}
                borderBottom="1px solid"
                borderColor="whiteAlpha.200"
                position="relative"
                bg="gray.950"
                color="white"
                flexShrink={0}
              >
                <Dialog.Title fontSize="md" fontWeight="bold" pr={12} truncate={'true'}>
                  {selectedVideo?.title}
                </Dialog.Title>
                <CloseButton
                  size="sm"
                  position="absolute"
                  right="16px"
                  top="50%"
                  transform="translateY(-50%)"
                  onClick={handleCloseDialog}
                  color="white"
                  _hover={{ bg: "whiteAlpha.200" }}
                  cursor="pointer"
                />
              </Dialog.Header>

              <Dialog.Body p={0} flex={1} display="flex" flexDirection="column" bg="black" overflow="hidden">
                {selectedVideo && (
                  <Flex direction="column" w="100%" h="100%" overflow="hidden">
                    
                    {/* Explicitly calculates height to occupy perfect viewport bounds */}
                    <Box 
                      w="100%"
                      h="calc(100vh - 57px - 80px)" 
                      bg="black" 
                      position="relative" 
                      display="flex" 
                      alignItems="center" 
                      justifyContent="center"
                    >
                      <video
                        ref={videoRef}
                        controls
                        autoPlay
                        style={{
                          width: "100%",
                          height: "100%",
                          maxWidth: "100%",
                          maxHeight: "100%",
                          objectFit: "contain",
                          backgroundColor: "#000",
                        }}
                        onTimeUpdate={() =>
                          selectedVideo && handleTimeUpdate(selectedVideo)
                        }
                        onEnded={() =>
                          selectedVideo &&
                          trackVideoProgress(selectedVideo.id, 100, true)
                        }
                      >
                        <source
                          src={getVideoUrl(selectedVideo)}
                          type="video/mp4"
                        />
                        Your browser does not support the video tag.
                      </video>
                    </Box>

                    {/* Fixed Height Meta Panel Footer (80px) */}
                    <Box 
                      h="80px"
                      p={4} 
                      bg="gray.950" 
                      borderTop="1px solid" 
                      borderColor="whiteAlpha.100"
                      color="white"
                      flexShrink={0}
                      display="flex"
                      flexDirection="column"
                      justifyContent="center"
                    >
                      <Text fontWeight="bold" fontSize="md" color="white" truncate>
                        {selectedVideo.title}
                      </Text>
                      <HStack gap={4} fontSize="xs" color="gray.400" mt={0.5}>
                        <Text>Topic: {topic.name}</Text>
                        {selectedVideo.duration && (
                          <Text>
                            Duration: {formatDuration(selectedVideo.duration)}
                          </Text>
                        )}
                      </HStack>
                    </Box>
                  </Flex>
                )}
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
      {/* Upgrade Prompt Modal */}
      <UpgradePromptModal
        isOpen={modalState.isOpen}
        onClose={closeUpgradeModal}
        featureName={modalState.featureName}
        requiredPlan={modalState.requiredPlan}
        reason={modalState.reason}
        currentPlan={effectivePlan}
      />
    </Box>
  );
};

export default VideosList;