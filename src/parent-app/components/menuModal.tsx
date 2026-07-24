import React from 'react'
import {  Menu, Portal, IconButton } from "@chakra-ui/react";
import { VscKebabVertical } from "react-icons/vsc";

type Props = {
  editText: string;
  deleteText: string;
  setModal: React.Dispatch<React.SetStateAction<"" | "edit" | "delete">>;
  onSelect: (type: "edit" | "delete") => void;
};

const MenuModal = ({ editText, deleteText, onSelect }: Props) => {
  return (
    <Menu.Root positioning={{ placement: "bottom-end", gutter: 8 }}>
      <Menu.Trigger asChild>
        <IconButton 
          variant="ghost" 
          size={{ base: "md", md: "sm" }} 
          aria-label="Open menu"
          borderRadius="full"
          _active={{ bg: "gray.100" }}
        >
          <VscKebabVertical />
        </IconButton>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner zIndex={2000}>
          <Menu.Content 
            minW="120px" 
            borderRadius="lg" 
            boxShadow="lg"
            p={1}
          >
            <Menu.Item 
              value="edit" 
              fontSize="sm" 
              cursor="pointer" 
              py={3} 
              px={4}
              onSelect={() => onSelect('edit')}
              _active={{ bg: "blue.50" }}
            >
              {editText}
            </Menu.Item>
            <Menu.Item 
              value="delete" 
              fontSize="sm" 
              color="red.600" 
              cursor="pointer" 
              py={3} 
              px={4}
              onSelect={() => onSelect('delete')}
              _active={{ bg: "red.50" }}
            >
              {deleteText}
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}

export default MenuModal