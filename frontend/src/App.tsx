import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./index.css";
import HomePage from "./pages/Homepage/HomePage";
import MainLayout from "./layouts/MainLayout";
import NDA from "./pages/NDA/NDA";
import Projects from "./pages/Projects/projects";
import Teams from "./pages/Teams/teams";
import Users from "./pages/Users/users";
import Contact from "./pages/Contact/contact";
import AboutUs from "./pages/About/AboutUs";
import Activities from "./pages/Actvities/Activities";

function App() {
  // const [count, setCount] = useState(0);

  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/nda" element={<NDA />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/users" element={<Users />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/activities" element={<Activities />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
