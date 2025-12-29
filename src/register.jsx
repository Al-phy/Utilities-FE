
import React from "react";
import { useState } from "react";
import API from "./api";
 
 
function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
 
   const styles = {
    container: {
      maxWidth: "400px",
      margin: "50px auto",
      padding: "30px",
      background: "#f5f5f5",
      borderRadius: "8px",
      boxShadow: "0 8px 15px rgba(0, 0, 0, 0.1)",
      fontFamily: "Arial, sans-serif",
    },
    heading: {
      textAlign: "center",
      marginBottom: "25px",
      color: "#333",
    },
    form: {
      display: "flex",
      flexDirection: "column",
    },
    input: {
      padding: "12px 15px",
      marginBottom: "20px",
      border: "1.5px solid #ddd",
      borderRadius: "5px",
      fontSize: "16px",
      outline: "none",
    },
    inputFocus: {
      borderColor: "#007BFF",
    },
    button: {
      padding: "12px 20px",
      backgroundColor: "#3fe774ff",
      color: "white",
      border: "none",
      fontSize: "18px",
      borderRadius: "5px",
      cursor: "pointer",
    },
    message: {
      marginTop: "20px",
      textAlign: "center",
      fontWeight: "600",
      color: "red",
    },
  };
 
 
  async function handleRegister(e) {
    e.preventDefault();
 
    try {
 
 
      const response =  await API.post("/users/register", {
        username,
        email,
        password,
      });
 
      setMessage(response.data.message || "Registration successful!");
 
    } catch (error) {
      setMessage("Something went wrong!");
    }
  }
 
  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Register</h2>
 
      <form style={styles.form}onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
          required
        />
 
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          required
        />
 
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
        />
 
        <button type="submit" style={styles.button}>
          Register
        </button>
      </form>
 
      {message && <p style={styles.message}>{message}</p>}
    </div>
  );
}
 
export default Register;
 