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
} from "@chakra-ui/react";
import { LuArrowLeft, LuPlay } from "react-icons/lu";
import { useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoResource | null>(
    null
  );
  const videoRef = useRef<HTMLVideoElement>(null);

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleVideoClick = (video: VideoResource) => {
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
    // For Supabase Storage URLs
    if (video.url.startsWith("supabase://")) {
      const path = video.url.replace("supabase://", "");
      const { data } = supabase.storage.from("videos").getPublicUrl(path);
      return data.publicUrl;
    }
    return video.url;
  };

  // Generate thumbnail URL from video URL (simple approach)
  const getThumbnailUrl = (video: VideoResource) => {
    // If you have separate thumbnail URLs in your database, use them here
    // For now, we'll use a placeholder or generate from video URL
    const videoUrl = getVideoUrl(video);

    // For YouTube-like thumbnail pattern (if you use similar naming)
    if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
      const videoId = videoUrl.match(
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
      );
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId[1]}/mqdefault.jpg`;
      }
    }

    // Placeholder thumbnail - in production, you should store thumbnails in your database
    return `https://placehold.co/320x180/3B82F6/white?text=${encodeURIComponent(
      video.title
    )}`;
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
          {videos.map((video) => (
            <Box
              key={video.id}
              borderRadius="lg"
              overflow="hidden"
              bg="white"
              boxShadow="sm"
              border="1px solid"
              borderColor="gray.200"
              _hover={{
                boxShadow: "md",
                transform: "translateY(-2px)",
              }}
              transition="all 0.2s"
              cursor="pointer"
              onClick={() => handleVideoClick(video)}
            >
              <Box>
                {/* Video Thumbnail */}
                <Box position="relative">
                  <AspectRatio ratio={16 / 9} width="100%">
                    <Image
                      src={getThumbnailUrl(video)}
                      alt={video.title}
                      objectFit="cover"
                    />
                  </AspectRatio>

                  {/* Play button overlay */}
                  <Box
                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                    bg="blackAlpha.600"
                    borderRadius="full"
                    p={2}
                  >
                    <LuPlay size={24} color="white" />
                  </Box>

                </Box>

                {/* Video Info */}
                <Box flex={1} p={4}>
                  <Text fontWeight='300' fontSize="sm" mb={2}>
                    {video.title}
                  </Text>
                </Box>
              </Box>
            </Box>
          ))}
        </Grid>
      )}

      {/* Video Player Dialog */}
      <Dialog.Root
        open={isDialogOpen}
        onOpenChange={() => setIsDialogOpen(!isDialogOpen)}
        size="xl"
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title fontSize="xl" fontWeight="bold">
                  {selectedVideo?.title}
                </Dialog.Title>
                <CloseButton
                  size="sm"
                  position="absolute"
                  right="12px"
                  top="12px"
                  onClick={handleCloseDialog}
                  cursor="pointer"
                />
              </Dialog.Header>
              <Dialog.Body>
                {selectedVideo && (
                  <Box>
                    {/* Video Player */}
                    <AspectRatio ratio={16 / 9} mb={4}>
                      <video
                        ref={videoRef}
                        controls
                        autoPlay
                        style={{
                          width: "100%",
                          borderRadius: "12px",
                          backgroundColor: "#000",
                        }}
                      >
                        <source
                          src={getVideoUrl(selectedVideo)}
                          type="video/mp4"
                        />
                        Your browser does not support the video tag.
                      </video>
                    </AspectRatio>

                    {/* Video Info */}
                    <Box p={4} bg="gray.50" borderRadius="md">
                      <Text fontWeight="bold" fontSize="lg" mb={2}>
                        {selectedVideo.title}
                      </Text>
                      <Text fontSize="sm" color="gray.600" mb={2}>
                        Topic: {topic.name}
                      </Text>
                      {selectedVideo.duration && (
                        <Text fontSize="sm" color="gray.600">
                          Duration: {formatDuration(selectedVideo.duration)}
                        </Text>
                      )}
                    </Box>
                  </Box>
                )}
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  );
};

export default VideosList;
