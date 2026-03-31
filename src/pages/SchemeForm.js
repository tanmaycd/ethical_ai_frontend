import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";


export default function SchemeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const chatEndRef = useRef(null);

  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm your AI Readiness Assistant. Let's see if you're ready for this scheme. Please tell me your age, annual income, occupation, and location to get started. You can also upload any documents for verification." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [lastAnalysis, setLastAnalysis] = useState(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = error => reject(error);
    });
  };

  const handleSend = async (e, files = []) => {
    if (e) e.preventDefault();
    if (!input.trim() && files.length === 0) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage || "Uploaded documents for verification." }]);
    setLoading(true);

    try {
      const base64Images = [];
      for (let i = 0; i < files.length; i++) {
        const base64 = await convertToBase64(files[i]);
        base64Images.push(base64);
      }

      const response = await fetch("https://ethical-ai-backend.onrender.com/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          chatHistory: messages,
          schemeId: id,
          form: formData,
          images: base64Images
        }),
      });

      const data = await response.json();
      
      if (data.userData) setFormData(data.userData);
      if (data.ai) setLastAnalysis({ ...data.ai, score: data.score });

      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.ai?.reply || "I've analyzed your details.",
        score: data.score,
        status: data.ai?.eligibilityStatus,
        summary: data.ai?.summary
      }]);

    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting to the server. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '900px', height: '85vh', display: 'flex', gap: '20px' }}>
      {/* Chat Section */}
      <div style={{ flex: 2, display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'white', borderRadius: '12px', padding: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
          <h3 style={{ margin: 0 }}>{id?.toUpperCase()} Assistant</h3>
          <button onClick={() => navigate("/dashboard")} style={{ width: 'auto', padding: '5px 15px' }}>Exit</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '15px 0', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ 
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              backgroundColor: msg.role === "user" ? "#3498db" : "#f1f1f1",
              color: msg.role === "user" ? "white" : "black",
              padding: '12px 16px',
              borderRadius: '18px',
              maxWidth: '85%',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}>
              <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{msg.content}</p>
            </div>
          ))}
          {loading && <div style={{ alignSelf: 'flex-start', color: '#888', fontStyle: 'italic' }}>AI is thinking...</div>}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSend} style={{ borderTop: '1px solid #eee', paddingTop: '15px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input 
            type="file" 
            multiple 
            id="file-upload" 
            style={{ display: 'none' }} 
            accept="image/*"
            onChange={(e) => handleSend(null, e.target.files)}
          />
          <label htmlFor="file-upload" style={{ cursor: 'pointer', fontSize: '20px', padding: '5px' }}>📎</label>
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="Type your message..." 
            style={{ flex: 1, margin: 0, padding: '10px 15px', borderRadius: '20px', border: '1px solid #ddd' }}
          />
          <button type="submit" disabled={loading} style={{ width: 'auto', margin: 0, padding: '10px 20px', borderRadius: '20px' }}>Send</button>
        </form>
      </div>

      {/* Persistent Summary Card Section */}
      {lastAnalysis && (
        <div style={{ flex: 1, height: '100%', backgroundColor: '#f9f9f9', borderRadius: '12px', padding: '20px', overflowY: 'auto', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
          <h3 style={{ marginTop: 0, borderBottom: '2px solid #3498db', paddingBottom: '10px' }}>Live Readiness Report</h3>
          
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <span>Score</span>
              <span>{lastAnalysis.score}/100</span>
            </div>
            <div style={{ backgroundColor: '#e0e0e0', height: '10px', borderRadius: '5px', marginTop: '8px' }}>
              <div style={{ 
                backgroundColor: lastAnalysis.score > 80 ? '#27ae60' : lastAnalysis.score > 50 ? '#f39c12' : '#e74c3c', 
                width: `${lastAnalysis.score}%`, 
                height: '100%', 
                borderRadius: '5px',
                transition: 'width 0.5s ease-in-out'
              }}></div>
            </div>
            <p style={{ textAlign: 'center', marginTop: '5px', fontWeight: 'bold', color: lastAnalysis.score > 80 ? '#27ae60' : lastAnalysis.score > 50 ? '#f39c12' : '#e74c3c' }}>
              Risk Level: {lastAnalysis.eligibilityStatus}
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#2c3e50', marginBottom: '8px' }}>Critical Risks</h4>
            <ul style={{ paddingLeft: '20px', fontSize: '0.9em' }}>
              {lastAnalysis.risks?.map((r, i) => <li key={i} style={{ marginBottom: '5px' }}>{r}</li>)}
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#2c3e50', marginBottom: '8px' }}>Action Plan</h4>
            <ul style={{ paddingLeft: '20px', fontSize: '0.9em' }}>
              {lastAnalysis.improvements?.map((imp, i) => <li key={i} style={{ marginBottom: '5px', color: '#2980b9' }}>{imp}</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
