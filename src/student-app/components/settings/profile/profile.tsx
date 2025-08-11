import { Box, Heading, Text } from "@chakra-ui/react";
import { useAuthdStudentData } from "@/student-app/context/studentDataContext";
import ChildrenProfile from "./children-profile";
import StudentProfile from "./student-profile";

type Props = {};

const Profile = (props: Props) => {
  const { authdStudent } = useAuthdStudentData();
  return (
    <Box>
      <Heading as="h2" size="lg" mb={4}>
        Profile Settings
      </Heading>
      <Text mb={4}>
        Manage your profile information, including your name, email, and other
        personal details.
      </Text>

      {authdStudent?.is_child ? <ChildrenProfile /> : <StudentProfile />}
    </Box>
  );
};

export default Profile;
