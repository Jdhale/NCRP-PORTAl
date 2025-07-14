import { Link } from "react-router-dom";
import { Button } from "../components/Button";
import { Card, CardContent } from "../components/card";
import { motion } from "framer-motion"; // Optional, for animation
import { ShieldCheck } from "lucide-react"; // Optional icon

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 flex flex-col items-center justify-start relative">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-blue-900 bg-opacity-95 shadow-lg p-4 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4">
          <h1 className="text-white text-xl font-bold tracking-wide">CyberSecure Portal</h1>
          <ul className="flex space-x-6 text-white text-md font-medium">
            <li><a href="#home" className="hover:text-blue-300 transition">Home</a></li>
            <li><a href="#file" className="hover:text-blue-300 transition">File Complaint</a></li>
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      <header id="home" className="pt-32 pb-16 text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-900">
            NCRP Cybercrime Reporting Portal
          </h1>
          <p className="text-md sm:text-lg mt-4 text-gray-700">
            File your cybercrime complaints with ease and security.
          </p>
        </motion.div>
      </header>

      {/* Card Section */}
      <motion.div
        id="file"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        <Card className="w-full max-w-3xl mx-auto shadow-2xl rounded-3xl border border-blue-300 bg-white text-center">
          <CardContent className="p-10">
            <div className="flex justify-center mb-4">
              <ShieldCheck size={48} className="text-blue-700" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-blue-900 mb-2">
              File Your Complaint
            </h2>
            <p className="text-md sm:text-lg text-gray-600 mb-6">
              <center>Click the button below to report a cybercrime incident securely.</center>
            </p>
            <Link to="/form">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition duration-300">
                File Complaint
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>

      {/* Footer */}
      <footer className="text-center py-8 mt-16 text-gray-700 text-sm">
        <p>&copy; 2025 NCRP Portal. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
