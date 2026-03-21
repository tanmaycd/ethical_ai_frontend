import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth } from "../firebase";

export default function SchemeForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    age: "",
    income: "",
    occupation: "",
    location: "",
  });

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]); // Only send base64 data
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async () => {
    if (!auth.currentUser) {
      alert("Please login to continue.");
      return;
    }
    setLoading(true);
    try {
      // 1. Direct Validation: Convert files to base64
      const base64Images = [];
      for (let i = 0; i < files.length; i++) {
        const base64 = await convertToBase64(files[i]);
        base64Images.push(base64);
      }

      // 2. Call Backend Scoring + AI API
      const response = await fetch("https://ethical-ai-backend.onrender.com/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          schemeId: id,
          images: base64Images // Send real base64 images for AI verification
        }),
      });

      const data = await response.json();
      setResult(data);

    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    const riskLevel = result.score > 80 ? "Low" : result.score > 50 ? "Medium" : "High";
    const riskColor = riskLevel === "Low" ? "#27ae60" : riskLevel === "Medium" ? "#f39c12" : "#e74c3c";

    return (
      <div className="container">
        <h2>Readiness Score: {result.score}/100</h2>
        <div className="progress-bar-bg">
          <div className="progress-bar" style={{ width: `${result.score}%`, backgroundColor: riskColor }}></div>
        </div>
        
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <span style={{ 
            padding: '8px 16px', 
            borderRadius: '20px', 
            backgroundColor: riskColor, 
            color: 'white', 
            fontWeight: 'bold' 
          }}>
            Risk Level: {riskLevel}
          </span>
        </div>

        <div className="ai-report">
          <h3>AI Analysis Report</h3>
          <p><strong>Eligibility Status:</strong> {result.ai?.eligibilityStatus || "Unknown"}</p>
          <p><strong>Summary:</strong> {result.ai?.summary || "No summary available."}</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <h4>Risks Identified:</h4>
              <ul style={{ paddingLeft: '20px' }}>{(result.ai?.risks || []).map((r, i) => <li key={i}>{r}</li>)}</ul>
            </div>
            <div>
              <h4>Preparation Plan:</h4>
              <ul style={{ paddingLeft: '20px' }}>{(result.ai?.improvements || []).map((imp, i) => <li key={i}>{imp}</li>)}</ul>
            </div>
          </div>

          {result.issues && result.issues.length > 0 && (
            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff5f5', borderRadius: '8px' }}>
              <h4 className="text-red">Critical Issues Found:</h4>
              <ul style={{ paddingLeft: '20px' }}>{(result.issues || []).map((iss, i) => <li key={i} className="text-red">{iss}</li>)}</ul>
            </div>
          )}
        </div>
        <button onClick={() => navigate("/dashboard")} style={{ marginTop: '20px' }}>Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Scheme Application Readiness</h2>
      <div className="form-group">
        <input placeholder="Age" type="number" onChange={(e) => setForm({ ...form, age: e.target.value })} />
        <input placeholder="Annual Income" type="number" onChange={(e) => setForm({ ...form, income: e.target.value })} />
        <input placeholder="Occupation" onChange={(e) => setForm({ ...form, occupation: e.target.value })} />
        <input placeholder="Location" onChange={(e) => setForm({ ...form, location: e.target.value })} />
      </div>

      <div className="file-upload">
        <h4>Upload Documents for Verification</h4>
        <input 
          type="file" 
          multiple 
          accept="image/jpeg,image/png"
          onChange={(e) => setFiles(e.target.files)} 
        />
        <small>Supported formats: JPG, PNG (Max 5MB)</small>
      </div>

      <button disabled={loading} onClick={handleSubmit}>
        {loading ? "Analyzing..." : "Check Readiness"}
      </button>
    </div>
    );
    }
