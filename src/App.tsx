import { useRoutes } from "react-router-dom";
import { StudentsDataProvider } from "@/parent-app/context/studentsDataContext";
import { UserProvider } from "@/parent-app/context/parentDataContext";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import routes from "./routes";

function App() {
  const element = useRoutes(routes);
  return (
    <UserProvider>
      <StudentsDataProvider>{element}</StudentsDataProvider>
    </UserProvider>
  );
}

export default App;
