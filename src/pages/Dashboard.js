import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";


const schemes = [
  { id: "scholarship", name: "Scholarship Scheme", description: "Financial aid for students pursuing higher education." },
  { id: "farmer", name: "Farmer Subsidy Scheme", description: "Direct financial support for purchasing seeds and equipment." },
  { id: "employment", name: "Employment Scheme", description: "Assistance in finding jobs and vocational training." },
  { id: "health", name: "Health Benefit Scheme", description: "Insurance coverage for major medical expenses." },
];

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Available Government Schemes</h2>
        <button style={{ width: "auto" }} onClick={handleLogout}>Logout</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px" }}>
        {schemes.map((scheme) => (
          <div key={scheme.id} className="scheme-card" onClick={() => navigate(`/scheme/${scheme.id}`)}>
            <h3>{scheme.name}</h3>
            <p>{scheme.description}</p>
            <button>Check Eligibility</button>
          </div>
        ))}
      </div>
    </div>
  );
}