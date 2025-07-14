// NCRPPortal.jsx
import { useState } from "react";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Card, CardContent } from "../components/card";
import { Textarea } from "../components/textarea";
import { Send } from "lucide-react";

export default function NCRPPortal() {
  const [report, setReport] = useState("");
  const [response, setResponse] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [showReview, setShowReview] = useState(false);

  const [userInfo, setUserInfo] = useState({
    name: "",
    email:"",
    date: "",
    time: "",
    location: "",
    reason: ""
  });

  const handleSubmit = () => {
    const fieldsFilled = Object.values({ ...userInfo, description: report }).every(
      field => field && field.trim() !== ""
    );
    if (!fieldsFilled) {
      setResponse("⚠️ Please fill in all required fields before submitting.");
      return;
    }
    setShowReview(true);
  };

  const handleConfirmDownload = async () => {
    setShowReview(false);
    try {
      setResponse("⏳ Generating PDF...");
      const pdfRes = await fetch("http://localhost:8000/generate-pdf", {
        method: "POST",
        body: new URLSearchParams({
          complaint: report,
          name: userInfo.name,
          email: userInfo.email,
          date: userInfo.date,
          time: userInfo.time,
          location: userInfo.location
        })
      });
      if (!pdfRes.ok) throw new Error("Failed to generate PDF");
      const blob = await pdfRes.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "cybercrime_report.pdf";
      link.click();
      window.URL.revokeObjectURL(url);
      setResponse("✅ PDF downloaded successfully.");
      setUserInfo({ name: "", email: "", date: "", time: "", location: "", reason: "" });
      setReport("");
    } catch (error) {
      console.error(error);
      setResponse("❌ Could not generate PDF. Try again later.");
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;
    setChatHistory(prev => [...prev, { text: chatMessage, sender: "user" }]);
    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        body: new URLSearchParams({ msg: chatMessage })
      });
      const data = await res.json();
      setChatHistory(prev => [...prev, { text: data.response, sender: "bot" }]);
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [...prev, { text: "❌ Could not reach chatbot.", sender: "bot" }]);
    }
    setChatMessage("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 flex flex-col items-center p-6">
      <h1 className="text-4xl font-bold mb-4 text-blue-900">🛡️ NCRP Cybercrime Reporting Portal</h1>
      <p className="text-gray-700 mb-6 text-center max-w-xl">
        Fill out the details below to report an incident. We'll generate a professional PDF report you can keep.
      </p>

      <Card className="w-full max-w-3xl shadow-lg rounded-2xl border border-blue-200 bg-white text-black">
        <CardContent className="p-8 space-y-4">
          <h2 className="text-xl font-semibold text-blue-800 mb-2">Incident Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input placeholder="Your Name" value={userInfo.name}
              onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}/>
            <Input type="email" value={userInfo.email}
              onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}/>
            <Input type="date" value={userInfo.date}
              onChange={(e) => setUserInfo({ ...userInfo, date: e.target.value })}/>
            <Input type="time" value={userInfo.time}
              onChange={(e) => setUserInfo({ ...userInfo, time: e.target.value })}/>
            <Input placeholder="Incident Location" value={userInfo.location}
              onChange={(e) => setUserInfo({ ...userInfo, location: e.target.value })}
              className="md:col-span-2"/>
          </div>
          <Textarea placeholder="Reason for delay (if any)" value={userInfo.reason}
            onChange={(e) => setUserInfo({ ...userInfo, reason: e.target.value })} className="h-20"/>
          <Textarea placeholder="Describe the incident..." value={report}
            onChange={(e) => setReport(e.target.value)} className="h-32"/>
          <Button onClick={handleSubmit} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg">
            Submit Report & Review PDF
          </Button>
          {response && (
            <p className={`mt-2 text-center font-medium ${response.includes("⚠️") || response.includes("❌") ? "text-red-600" : "text-green-600"}`}>
              {response}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      {showReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white max-w-lg w-full rounded-xl shadow-2xl p-6 overflow-auto">
            <h2 className="text-xl font-bold text-blue-800 mb-4">📄 PDF Preview</h2>
            <div className="border border-gray-300 rounded-lg p-4 space-y-2 text-sm leading-relaxed text-gray-800 bg-gray-50">
              <p><strong>Name:</strong> {userInfo.name}</p>
              <p><strong>Email:</strong> {userInfo.email}</p>
              <p><strong>Date & Time:</strong> {userInfo.date} {userInfo.time}</p>
              <p><strong>Location:</strong> {userInfo.location}</p>
              <p><strong>Reason for delay:</strong> {userInfo.reason}</p>
              <p><strong>Description of Incident:</strong> {report}</p>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowReview(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Edit</button>
              <button onClick={handleConfirmDownload}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Confirm & Download PDF</button>
            </div>
          </div>
        </div>
      )}

      {/* Chatbot toggle */}
      <button onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg">💬 Chat</button>
      {chatOpen && (
        <div className="fixed bottom-20 right-6 w-96 h-[28rem] bg-gray-900 text-white shadow-2xl rounded-2xl flex flex-col">
          <div className="flex justify-between items-center p-3 bg-blue-700 rounded-t-2xl">
            <h2 className="text-lg font-bold">NCRP Chatbot</h2>
            <button onClick={() => setChatOpen(false)}>✖</button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {chatHistory.length === 0 ? <p className="text-gray-400 text-center">How can I assist you today?</p> :
              chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`px-4 py-2 rounded-xl max-w-[80%] text-sm ${msg.sender === "user" ? "bg-blue-600" : "bg-gray-700"}`}>{msg.text}</div>
                </div>
              ))}
          </div>
          <div className="flex items-center p-3 border-t border-gray-700 bg-gray-800">
            <input type="text" value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Type a message..." className="flex-1 bg-gray-700 text-white p-2 rounded-lg"/>
            <button onClick={handleSendMessage} className="ml-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg">
              <Send size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
