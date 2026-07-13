import "./App.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Outlet } from "react-router-dom";

import AuthProvider, { useAuth } from "./context/AuthContext";

function App() {
  const { user } = useAuth();
  return (
    <AuthProvider>
      <div className="mx-auto relative bg-yeah-primary text-yeah-text poppins-regular pt-2 selection:bg-slate-800 selection:text-pink-400 cursor-default overflow-x-hidden scroll-smooth">
        <Navbar />
        <Outlet />
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
