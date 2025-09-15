import { useRoutes } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import routes from "./routes";

function App() {
  const element = useRoutes(routes);
  return element;
}

export default App;
