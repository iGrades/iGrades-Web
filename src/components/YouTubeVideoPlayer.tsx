import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Box,
  Flex,
  HStack,
  Text,
  Icon,
} from "@chakra-ui/react";
import {
  FaPlay,
  FaPause,
  FaVolumeHigh,
  FaVolumeLow,
  FaVolumeXmark,
  FaExpand,
  FaCompress,
  FaGear,
  FaArrowRotateLeft,
  FaArrowRotateRight,
  FaYoutube,
} from "react-icons/fa6";
import { MdPictureInPictureAlt } from "react-icons/md";

interface YouTubeVideoPlayerProps {
  url: string;
  title?: string;
  autoPlay?: boolean;
}

// Utility to parse YouTube Video ID from any standard YouTube URL
const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  const regExp =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
};

// Format seconds into MM:SS or HH:MM:SS
const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  }
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

export const YouTubeVideoPlayer: React.FC<YouTubeVideoPlayerProps> = ({
  url,
  title = "How iGrades Works",
  autoPlay = true,
}) => {
  const youtubeId = getYouTubeVideoId(url);

  // If this is an actual YouTube link/ID, render the official YouTube IFrame Embed Player
  if (youtubeId) {
    return (
      <Box
        position="relative"
        w="100%"
        pt="56.25%" /* 16:9 aspect ratio */
        bg="#000"
        borderRadius="xl"
        overflow="hidden"
        boxShadow="0 10px 30px rgba(0,0,0,0.8)"
      >
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=${
            autoPlay ? "1" : "0"
          }&rel=0&modestbranding=1&enablejsapi=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            border: 0,
          }}
        />
      </Box>
    );
  }

  // Otherwise, render our custom YouTube-themed video player for direct video streams (e.g. Supabase MP4)
  return <YouTubeStyleHtml5Player url={url} title={title} autoPlay={autoPlay} />;
};

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

interface HTML5PlayerProps {
  url: string;
  title: string;
  autoPlay: boolean;
}

const YouTubeStyleHtml5Player: React.FC<HTML5PlayerProps> = ({
  url,
  title,
  autoPlay,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(0.9);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isSpeedMenuOpen, setIsSpeedMenuOpen] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number>(0);
  const [isHoveringProgress, setIsHoveringProgress] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [doubleClickFeedback, setDoubleClickFeedback] = useState<{
    type: "left" | "right";
    active: boolean;
  }>({ type: "right", active: false });

  // Reset controls hide timer
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        if (!isSpeedMenuOpen) {
          setShowControls(false);
        }
      }, 2500);
    }
  }, [isPlaying, isSpeedMenuOpen]);

  const volumeRef = useRef(volume);
  volumeRef.current = volume;

  // Autoplay and initial setup
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = volumeRef.current;
    if (autoPlay) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {
            // Autoplay with audio was prevented, fallback to muted autoplay
            video.muted = true;
            setIsMuted(true);
            video.play().then(() => setIsPlaying(true)).catch(() => {});
          });
      }
    }

    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [url, autoPlay]);

  // Handle Fullscreen state change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused || video.ended) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
      setShowControls(true);
    }
  }, []);

  const seekRelative = useCallback((seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    const newTime = Math.min(
      Math.max(0, video.currentTime + seconds),
      video.duration || 0
    );
    video.currentTime = newTime;
    setCurrentTime(newTime);
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  const changeVolume = useCallback((newVol: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = newVol;
    setVolume(newVol);
    if (newVol === 0) {
      video.muted = true;
      setIsMuted(true);
    } else {
      video.muted = false;
      setIsMuted(false);
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.code === "Space" || e.key === "k" || e.key === "K") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        toggleMute();
      } else if (e.key === "ArrowLeft" || e.key === "j" || e.key === "J") {
        e.preventDefault();
        seekRelative(-5);
      } else if (e.key === "ArrowRight" || e.key === "l" || e.key === "L") {
        e.preventDefault();
        seekRelative(5);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        changeVolume(Math.min(1, volume + 0.1));
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        changeVolume(Math.max(0, volume - 0.1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, toggleFullscreen, toggleMute, seekRelative, changeVolume, volume]);

  const togglePiP = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
      }
    } catch {
      // ignore
    }
  };

  const handleSpeedChange = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = rate;
    setPlaybackRate(rate);
    setIsSpeedMenuOpen(false);
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || isDragging) return;
    setCurrentTime(video.currentTime);

    // Buffer tracking
    if (video.buffered.length > 0) {
      for (let i = 0; i < video.buffered.length; i++) {
        if (
          video.buffered.start(i) <= video.currentTime &&
          video.buffered.end(i) >= video.currentTime
        ) {
          setBuffered(video.buffered.end(i));
          break;
        }
      }
    }
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration);
  };

  // Progress Bar Seek & Drag
  const calculateProgressFromEvent = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = progressBarRef.current;
    if (!bar) return 0;
    const rect = bar.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    return pos * duration;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const newTime = calculateProgressFromEvent(e);
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleProgressMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = progressBarRef.current;
    if (!bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverPosition(pos * 100);
    setHoverTime(pos * duration);
    setIsHoveringProgress(true);

    if (isDragging) {
      const video = videoRef.current;
      if (video) {
        video.currentTime = pos * duration;
        setCurrentTime(pos * duration);
      }
    }
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;

    if (clickX < width * 0.35) {
      // Double click left: rewind 10s
      seekRelative(-10);
      setDoubleClickFeedback({ type: "left", active: true });
      setTimeout(
        () => setDoubleClickFeedback((prev) => ({ ...prev, active: false })),
        600
      );
    } else if (clickX > width * 0.65) {
      // Double click right: forward 10s
      seekRelative(10);
      setDoubleClickFeedback({ type: "right", active: true });
      setTimeout(
        () => setDoubleClickFeedback((prev) => ({ ...prev, active: false })),
        600
      );
    } else {
      // Double click center: toggle fullscreen
      toggleFullscreen();
    }
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferPercentage = duration > 0 ? (buffered / duration) * 100 : 0;

  return (
    <Box
      ref={containerRef}
      position="relative"
      w="100%"
      bg="#000000"
      borderRadius="xl"
      overflow="hidden"
      boxShadow="0 20px 40px rgba(0,0,0,0.85)"
      cursor={showControls ? "default" : "none"}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        setIsHoveringProgress(false);
        if (isPlaying) setShowControls(false);
      }}
      userSelect="none"
      fontFamily="-apple-system, BlinkMacSystemFont, 'Roboto', 'Segoe UI', sans-serif"
    >
      {/* Video Element */}
      <Box
        position="relative"
        w="100%"
        pt="56.25%" /* 16:9 Aspect Ratio */
        onClick={togglePlay}
        onDoubleClick={handleDoubleClick}
      >
        <video
          ref={videoRef}
          src={url}
          playsInline
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            backgroundColor: "#000",
          }}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            setIsPlaying(false);
            setShowControls(true);
          }}
        />

        {/* Double Click 10s feedback overlay */}
        {doubleClickFeedback.active && (
          <Flex
            position="absolute"
            top="50%"
            left={doubleClickFeedback.type === "left" ? "20%" : "80%"}
            transform="translate(-50%, -50%)"
            bg="rgba(0, 0, 0, 0.65)"
            borderRadius="full"
            p={5}
            direction="column"
            align="center"
            justify="center"
            pointerEvents="none"
            animation="pulse 0.5s ease-out"
          >
            <Icon
              as={
                doubleClickFeedback.type === "left"
                  ? FaArrowRotateLeft
                  : FaArrowRotateRight
              }
              boxSize={6}
              color="white"
            />
            <Text fontSize="11px" fontWeight="700" color="white" mt={1}>
              10s
            </Text>
          </Flex>
        )}

        {/* Big Signature YouTube Play Button in Center when Paused */}
        {!isPlaying && (
          <Flex
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            pointerEvents="auto"
            cursor="pointer"
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            transition="transform 0.15s ease-out"
            _hover={{ transform: "translate(-50%, -50%) scale(1.1)" }}
          >
            <Box
              w={{ base: "64px", md: "72px" }}
              h={{ base: "44px", md: "50px" }}
              bg="#FF0000"
              borderRadius="14px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              boxShadow="0 4px 20px rgba(255, 0, 0, 0.4)"
            >
              <Box
                w="0"
                h="0"
                borderTop="10px solid transparent"
                borderBottom="10px solid transparent"
                borderLeft="18px solid white"
                ml="4px"
              />
            </Box>
          </Flex>
        )}

        {/* Top Gradient & YouTube Video Title */}
        <Flex
          position="absolute"
          top={0}
          left={0}
          right={0}
          p={{ base: 3, md: 4 }}
          bg="linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)"
          justify="space-between"
          align="center"
          opacity={showControls || !isPlaying ? 1 : 0}
          transition="opacity 0.25s ease"
          pointerEvents={showControls || !isPlaying ? "auto" : "none"}
        >
          <HStack gap={2}>
            <Icon as={FaYoutube} color="#FF0000" boxSize={5} />
            <Text
              color="white"
              fontWeight="600"
              fontSize={{ base: "xs", md: "sm" }}
              noOfLines={1}
            >
              {title}
            </Text>
          </HStack>

          <HStack
            gap={1}
            bg="rgba(0,0,0,0.4)"
            px={2.5}
            py={0.5}
            borderRadius="full"
            border="1px solid rgba(255,255,255,0.15)"
          >
            <Box w="6px" h="6px" borderRadius="full" bg="#22C55E" />
            <Text fontSize="11px" color="whiteAlpha.900" fontWeight="500">
              1080p HD
            </Text>
          </HStack>
        </Flex>
      </Box>

      {/* Bottom YouTube Controls Bar & Scrubber */}
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        bg="linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.6) 70%, rgba(0,0,0,0) 100%)"
        pt={6}
        pb={1}
        px={{ base: 2, md: 3 }}
        opacity={showControls || !isPlaying ? 1 : 0}
        transition="opacity 0.25s ease"
        pointerEvents={showControls || !isPlaying ? "auto" : "none"}
      >
        {/* Scrubber / Progress Bar Container */}
        <Box
          ref={progressBarRef}
          position="relative"
          h={isHoveringProgress ? "8px" : "4px"}
          transition="height 0.15s ease"
          cursor="pointer"
          mb={2}
          onClick={handleProgressClick}
          onMouseMove={handleProgressMouseMove}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseEnter={() => setIsHoveringProgress(true)}
          onMouseLeave={() => setIsHoveringProgress(false)}
        >
          {/* Background Track */}
          <Box
            position="absolute"
            inset={0}
            bg="rgba(255, 255, 255, 0.22)"
            borderRadius="full"
          />

          {/* Buffer Progress */}
          <Box
            position="absolute"
            top={0}
            bottom={0}
            left={0}
            w={`${bufferPercentage}%`}
            bg="rgba(255, 255, 255, 0.45)"
            borderRadius="full"
          />

          {/* Active Played Progress (YouTube Red) */}
          <Box
            position="absolute"
            top={0}
            bottom={0}
            left={0}
            w={`${progressPercentage}%`}
            bg="#FF0000"
            borderRadius="full"
          />

          {/* Scrubber Knob (Red circle on handle) */}
          <Box
            position="absolute"
            top="50%"
            left={`${progressPercentage}%`}
            transform="translate(-50%, -50%)"
            w={isHoveringProgress ? "14px" : "10px"}
            h={isHoveringProgress ? "14px" : "10px"}
            bg="#FF0000"
            borderRadius="full"
            boxShadow="0 0 4px rgba(0,0,0,0.6)"
            transition="width 0.1s ease, height 0.1s ease"
          />

          {/* Hover Time Tooltip */}
          {isHoveringProgress && hoverTime !== null && (
            <Box
              position="absolute"
              bottom="16px"
              left={`${hoverPosition}%`}
              transform="translateX(-50%)"
              bg="rgba(28, 28, 28, 0.95)"
              color="white"
              px={2}
              py={0.5}
              borderRadius="md"
              fontSize="11px"
              fontWeight="600"
              pointerEvents="none"
              whiteSpace="nowrap"
              boxShadow="0 2px 6px rgba(0,0,0,0.5)"
            >
              {formatTime(hoverTime)}
            </Box>
          )}
        </Box>

        {/* Controls Layout */}
        <Flex justify="space-between" align="center" minH="38px">
          {/* Left Controls */}
          <HStack gap={{ base: 2, sm: 3 }}>
            {/* Play / Pause Toggle */}
            <Box
              as="button"
              color="white"
              p={1.5}
              cursor="pointer"
              _hover={{ color: "#FF0000" }}
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              <Icon as={isPlaying ? FaPause : FaPlay} boxSize={4} />
            </Box>

            {/* Skip Back 10s */}
            <Box
              as="button"
              color="whiteAlpha.800"
              p={1.5}
              cursor="pointer"
              _hover={{ color: "white" }}
              onClick={() => seekRelative(-10)}
              title="Rewind 10s (J)"
            >
              <Icon as={FaArrowRotateLeft} boxSize={3.5} />
            </Box>

            {/* Skip Forward 10s */}
            <Box
              as="button"
              color="whiteAlpha.800"
              p={1.5}
              cursor="pointer"
              _hover={{ color: "white" }}
              onClick={() => seekRelative(10)}
              title="Forward 10s (L)"
            >
              <Icon as={FaArrowRotateRight} boxSize={3.5} />
            </Box>

            {/* Volume & Slider */}
            <HStack gap={1.5} role="group">
              <Box
                as="button"
                color="white"
                p={1.5}
                cursor="pointer"
                _hover={{ color: "whiteAlpha.800" }}
                onClick={toggleMute}
                aria-label="Mute (M)"
              >
                <Icon
                  as={
                    isMuted || volume === 0
                      ? FaVolumeXmark
                      : volume < 0.5
                      ? FaVolumeLow
                      : FaVolumeHigh
                  }
                  boxSize={4}
                />
              </Box>

              <Box
                w={{ base: "48px", sm: "64px" }}
                display="flex"
                alignItems="center"
              >
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => changeVolume(parseFloat(e.target.value))}
                  style={{
                    width: "100%",
                    height: "4px",
                    accentColor: "#FF0000",
                    cursor: "pointer",
                  }}
                  aria-label="Volume Slider"
                />
              </Box>
            </HStack>

            {/* Timestamps */}
            <Text
              fontSize={{ base: "11px", sm: "12px" }}
              color="whiteAlpha.900"
              fontWeight="500"
              ml={1}
            >
              {formatTime(currentTime)}{" "}
              <Box as="span" color="whiteAlpha.500">
                /
              </Box>{" "}
              {formatTime(duration)}
            </Text>
          </HStack>

          {/* Right Controls */}
          <HStack gap={{ base: 2, sm: 2.5 }} position="relative">
            {/* Speed Settings Button */}
            <Box position="relative">
              <Box
                as="button"
                color={playbackRate !== 1 ? "#FF0000" : "white"}
                p={1.5}
                cursor="pointer"
                _hover={{ color: "#FF0000" }}
                onClick={() => setIsSpeedMenuOpen(!isSpeedMenuOpen)}
                title="Playback speed"
              >
                <HStack gap={1}>
                  <Icon as={FaGear} boxSize={3.5} />
                  {playbackRate !== 1 && (
                    <Text fontSize="10px" fontWeight="bold">
                      {playbackRate}x
                    </Text>
                  )}
                </HStack>
              </Box>

              {/* Speed Menu Popup */}
              {isSpeedMenuOpen && (
                <Box
                  position="absolute"
                  bottom="100%"
                  right={0}
                  mb={2}
                  bg="rgba(28, 28, 28, 0.96)"
                  border="1px solid rgba(255,255,255,0.12)"
                  borderRadius="lg"
                  p={1.5}
                  minW="120px"
                  boxShadow="0 10px 25px rgba(0,0,0,0.7)"
                  zIndex={50}
                >
                  <Text
                    fontSize="10px"
                    fontWeight="700"
                    color="whiteAlpha.600"
                    px={2.5}
                    py={1}
                    textTransform="uppercase"
                  >
                    Playback Speed
                  </Text>
                  {SPEED_OPTIONS.map((rate) => (
                    <Box
                      key={rate}
                      as="button"
                      w="100%"
                      textAlign="left"
                      px={2.5}
                      py={1.5}
                      borderRadius="md"
                      fontSize="11px"
                      fontWeight={playbackRate === rate ? "700" : "500"}
                      color={playbackRate === rate ? "#FF0000" : "white"}
                      bg={
                        playbackRate === rate
                          ? "whiteAlpha.100"
                          : "transparent"
                      }
                      _hover={{ bg: "whiteAlpha.200" }}
                      onClick={() => handleSpeedChange(rate)}
                    >
                      {rate === 1 ? "Normal (1x)" : `${rate}x`}
                    </Box>
                  ))}
                </Box>
              )}
            </Box>

            {/* Picture-in-Picture */}
            <Box
              as="button"
              color="whiteAlpha.800"
              p={1.5}
              cursor="pointer"
              _hover={{ color: "white" }}
              onClick={togglePiP}
              title="Miniplayer (i)"
              display={{ base: "none", sm: "block" }}
            >
              <Icon as={MdPictureInPictureAlt} boxSize={4} />
            </Box>

            {/* Fullscreen Toggle */}
            <Box
              as="button"
              color="white"
              p={1.5}
              cursor="pointer"
              _hover={{ color: "#FF0000" }}
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit Fullscreen (F)" : "Fullscreen (F)"}
            >
              <Icon as={isFullscreen ? FaCompress : FaExpand} boxSize={3.5} />
            </Box>

            {/* Small YouTube Logo in Corner */}
            <HStack
              gap={1}
              opacity={0.85}
              _hover={{ opacity: 1 }}
              cursor="default"
              ml={1}
            >
              <Icon as={FaYoutube} color="#FF0000" boxSize={4} />
            </HStack>
          </HStack>
        </Flex>
      </Box>
    </Box>
  );
};
