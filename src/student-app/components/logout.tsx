import { useAuthdStudentData } from "../context/studentDataContext";

type Props = {}

const Logout = (props: Props) => {

    const {authdStudent: currentStudent} = useAuthdStudentData();

    const logoutFunction = () => {
        localStorage.removeItem("currentStudent");
    }
  return (
    <div>logout</div>
  )
}

export default Logout