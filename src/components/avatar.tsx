import { Avatar } from "@chakra-ui/react";

type Props = {
  username?: string;
  profileImage?: any;
  size?: "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
};
const AvatarComp = ({ username, profileImage, size = "md" }: Props) => {
  const colorPalette = ["red", "blue", "green", "yellow", "purple", "orange"];

  const pickPalette = (name: string) => {
    const index = (name || "").charCodeAt(0) % colorPalette.length;
    return colorPalette[isNaN(index) ? 0 : index];
  };

  return (
    <Avatar.Root size={size} colorPalette={pickPalette(username ?? "")}>
      <Avatar.Fallback name={username} />
      <Avatar.Image src={profileImage} />
    </Avatar.Root>
  );
};

export default AvatarComp;