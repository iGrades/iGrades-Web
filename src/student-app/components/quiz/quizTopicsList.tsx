import { Box, Flex, RadioCard, HStack, Image} from "@chakra-ui/react";
import { useState } from "react";
import quickTestIcon from '@/assets/quickTest_ico.png'
import examTestIcon from '@/assets/examText_ico.png'

type Props = {
  topicList: Topic[];
  selectedCourses: string[];
};

interface Topic {
  id: string;
  name: string;
  description?: string;
}

const QuizTopicsList = ({ topicList, selectedCourses }: Props) => {
  const [value, setValue] = useState<string | null>("");

  const items = [
    {
      value: "test",
      icon: quickTestIcon,
      title: "Quick Test",
      description:
        "In quick test mode, you will attempt 15 multiple choice questions in 20 minutes",
    },
    {
      value: "exam",
      icon: examTestIcon,
      title: "Examination",
      description:
        "In examination mode, you will attempt 60 multiple choice questions in 90 minutes",
    },
  ];
  return (
    <>
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align="center"
        mb={4}
        mt={4}
      >
        <RadioCard.Root
          value={value}
          size="sm"
          variant="outline"
          onValueChange={(e) => setValue(e.value)}
        >
          <HStack
          >
            {items.map((item) => (
              <RadioCard.Item key={item.value} value={item.value}>
                <RadioCard.ItemHiddenInput />
                <RadioCard.ItemControl>
                  <Image src={item.icon} height="30px" alt="icon" />
                  <RadioCard.ItemContent>
                    <RadioCard.ItemText>{item.title}</RadioCard.ItemText>
                    <RadioCard.ItemDescription fontSize="xs">
                      {item.description}
                    </RadioCard.ItemDescription>
                  </RadioCard.ItemContent>
                  <RadioCard.ItemIndicator />
                </RadioCard.ItemControl>
              </RadioCard.Item>
            ))}
          </HStack>
        </RadioCard.Root>
      </Flex>
      <Box bg="white" rounded="lg" shadow="lg" p={4} mb={20} h="75vh">
        {topicList?.map((topic) => (
          <Box key={topic.id}>{topic.name}</Box>
        ))}
      </Box>
    </>
  );
};

export default QuizTopicsList;
