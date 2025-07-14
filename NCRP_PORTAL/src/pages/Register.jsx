import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Card, CardContent } from "../components/card";

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [response, setResponse] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) {
      setResponse("Please fill in all fields.");
      return;
    }

    try {
      // ✅ Send POST request to backend
      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        setResponse("Registration successful. Redirecting to login...");
        setTimeout(() => {
          navigate("/");  // back to login page
        }, 1500);
      } else {
        setResponse(data.message || "Registration failed.");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      setResponse("Error connecting to server.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-green-300 flex flex-col items-center p-6">
      <h1 className="text-4xl font-extrabold mb-6 text-green-900">Register to NCRP Portal</h1>
      <Card className="w-full max-w-md shadow-xl rounded-2xl border border-green-300 bg-white">
        <CardContent className="p-8 text-black">
          <p className="text-gray-700 mb-6 text-lg font-medium">Create your account:</p>
          
          <Input
            type="email"
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4 p-3 border border-gray-300 rounded-lg shadow-sm"
          />

          {/* Password field with show/hide */}
          <div className="relative mb-4">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg shadow-sm w-full"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-green-600"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <Button
            onClick={handleRegister}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-md transition duration-300"
          >
            Register
          </Button>

          {response && <p className="mt-4 text-green-700 font-semibold">{response}</p>}

          <p className="mt-4 text-gray-600">
            Already have an account?
            <span
              onClick={() => navigate('/')}
              className="text-green-600 cursor-pointer font-semibold ml-1"
            >
              Login
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
