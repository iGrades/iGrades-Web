import { Box } from "@chakra-ui/react";
import { useAuthdStudentData } from "@/student-app/context/studentDataContext";
import ChildrenProfile from "./children-profile";
import StudentProfile from "./student-profile";


const Profile = () => {
  const { authdStudent } = useAuthdStudentData();
  return (
    <Box>

      {authdStudent?.is_child ? <ChildrenProfile /> : <StudentProfile />}
    </Box>
  );
};

export default Profile;
