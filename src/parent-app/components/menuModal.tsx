import React from 'react'
import { Button, Menu, Portal } from "@chakra-ui/react";
import { VscKebabVertical } from "react-icons/vsc";

type Props = {
  editText: string;
  deleteText: string;
  setModal: React.Dispatch<React.SetStateAction<"" | "edit" | "delete">>;
  onSelect: (type: "edit" | "delete") => void;
};

const MenuModal = ({editText, deleteText, onSelect}: Props) => {
  return (
    <Menu.Root positioning={{ placement: "left-start" }}>
      <Menu.Trigger asChild>
        <Button variant="plain" size="sm">
          <VscKebabVertical />
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.Item value="edit" fontSize="xs" cursor="pointer" onSelect={()=> onSelect('edit')}>
              {editText}
            </Menu.Item>
            <Menu.Item value="delete" fontSize="xs" cursor="pointer" onSelect={()=> onSelect('delete')}>
              {deleteText}
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}

export default MenuModal