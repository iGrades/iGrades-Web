import {
  Input,
  InputGroup, Icon
} from "@chakra-ui/react";
import type { InputProps } from "@chakra-ui/react"
import { IoIosSearch } from "react-icons/io";
// import { useSubjects } from "@/student-app/context/dataContext";

interface SearchBarProps extends InputProps {
  placeholder?: string;
  searchResult: never[]
  setSearchResult: React.Dispatch<React.SetStateAction<never[]>>
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search student here...",
  ...rest
}) => {
  return (
    <InputGroup
      w={{ base: "100%", lg: "40%" }}
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
        color='gray.600'
        fontSize="xs"
        variant="subtle"
        bg="white"
        p={6}
        w="full"
        outline="none"
        
        border="1px solid"
        borderColor='fieldTextColor'
        rounded="md"
        // boxShadow='md'
        {...rest}
      />
    </InputGroup>
  );
};

export default SearchBar;
