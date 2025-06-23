import {
  Input,
  InputGroup,
} from "@chakra-ui/react";
import type { InputProps } from "@chakra-ui/react"
import { IoMdSearch } from "react-icons/io";

interface SearchBarProps extends InputProps {
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search grader here...",
  ...rest
}) => {
  return (
    <InputGroup w='40%' startElement={<IoMdSearch color="black" />}>
      <Input
        type="search"
        placeholder={placeholder}
        variant="subtle"
        bg="white"
        boxShadow="md"
        p={5}
        w="full"
        {...rest}
      />
    </InputGroup>
  );
};

export default SearchBar;
