import React from 'react'
import { Avatar, HStack } from "@chakra-ui/react";

type Props = {
  username?: string;
  profileImage?: any;
};
const AvatarComp = ({username, profileImage}: Props) => {
    const colorPalette = ["red", "blue", "green", "yellow", "purple", "orange"];

    const pickPalette = (name: string) => {
      const index = name.charCodeAt(0) % colorPalette.length;
      return colorPalette[index];
    };

  return (
    <HStack>
      <Avatar.Root colorPalette={pickPalette(username ?? "")}>
        <Avatar.Fallback name={username} />
        <Avatar.Image src={profileImage} />
      </Avatar.Root>
    </HStack>
  );
}

export default AvatarComp