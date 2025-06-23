import React from 'react'
import { Avatar, HStack } from "@chakra-ui/react";

type Props = {
  username?: string;
};
const AvatarComp = ({username}: Props) => {
    const colorPalette = ["red", "blue", "green", "yellow", "purple", "orange"];

    const pickPalette = (name: string) => {
      const index = name.charCodeAt(0) % colorPalette.length;
      return colorPalette[index];
    };

  return (
    <HStack>
      <Avatar.Root colorPalette={pickPalette(username ?? "")}>
        <Avatar.Fallback name={username} />
        <Avatar.Image src="https://bit.ly/broken-link" />
      </Avatar.Root>
    </HStack>
  );
}

export default AvatarComp