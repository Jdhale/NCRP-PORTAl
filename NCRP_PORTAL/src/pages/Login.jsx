import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Card, CardContent } from "../components/card";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [response, setResponse] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setResponse("⚠️ Please enter both email and password.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        setResponse("✅ Login successful. Redirecting...");
        setTimeout(() => {
          navigate("/Home");
        }, 1500);
      } else {
        setResponse(`❌ ${data.message || "Invalid email or password."}`);
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      setResponse("❌ Error connecting to server.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 flex flex-col items-center p-6">
      <h1 className="text-4xl font-extrabold mb-6 text-blue-900">Login to NCRP Portal</h1>
      <Card className="w-full max-w-md shadow-xl rounded-2xl border border-blue-300 bg-white">
        <CardContent className="p-8 text-black">
          <p className="text-gray-700 mb-6 text-lg font-medium">Enter your credentials to continue:</p>

          <Input
            type="email"
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4 p-3 border border-gray-300 rounded-lg shadow-sm"
          />

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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-blue-600"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <Button
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md transition duration-300"
          >
            Login
          </Button>

          {response && (
            <p className={`mt-4 font-semibold text-center ${response.includes("✅") ? "text-green-600" : "text-red-600"}`}>
              {response}
            </p>
          )}

          <p className="mt-4 text-gray-600">
            Don’t have an account?
            <span
              onClick={() => navigate('/register')}
              className="text-blue-600 cursor-pointer font-semibold ml-1"
            >
              Register
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
