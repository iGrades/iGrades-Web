import {
  Input,
  InputGroup, Icon
} from "@chakra-ui/react";
import type { InputProps } from "@chakra-ui/react"
import { IoIosSearch } from "react-icons/io";

interface SearchBarProps extends InputProps {
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search student here...",
  ...rest
}) => {
  return (
    <InputGroup
      w={{ base: "100%", md: "50%", lg: "40%" }}
      startElement={
        <Icon w="20px" h="20px">
          <IoIosSearch color="#BDBDBD" />
        </Icon>
      }
    >
      <Input
        type="search"
        placeholder={placeholder}
        _placeholder={{ color: "#BDBDBD" }}
        color='gray.500'
        fontSize="xs"
        variant="subtle"
        bg="white"
        p={6}
        w="full"
        outline="none"
        border="none"
        rounded="md"
        boxShadow='md'
        {...rest}
      />
    </InputGroup>
  );
};

export default SearchBar;
