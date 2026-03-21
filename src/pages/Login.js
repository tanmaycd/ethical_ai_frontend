import { useState } from "react";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate("/dashboard");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="container" style={{ maxWidth: "400px", marginTop: "100px" }}>
      <h2>AI Scheme Readiness Checker</h2>
      <form onSubmit={handleSubmit}>
        <h3>{isSignup ? "Create Account" : "Login"}</h3>
        <input 
          placeholder="Email" 
          type="email" 
          required 
          onChange={(e) => setEmail(e.target.value)} 
        />
        <input 
          placeholder="Password" 
          type="password" 
          required 
          onChange={(e) => setPassword(e.target.value)} 
        />

        <button type="submit">
          {isSignup ? "Sign Up" : "Log In"}
        </button>

        <p style={{ textAlign: "center", cursor: "pointer", color: "#3498db" }} onClick={() => setIsSignup(!isSignup)}>
          {isSignup ? "Already have an account? Log In" : "Don't have an account? Sign Up"}
        </p>
      </form>
    </div>
  );
}