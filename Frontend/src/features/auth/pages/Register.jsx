import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const {loading,handleRegister} = useAuth()

  const navigate = useNavigate()

  const handleSubmit = async (e) =>{
    e.preventDefault()
    await handleRegister(username,email,password)
    navigate('/')
  }

  if(loading){
    return(<h1>Loading...</h1>)
  }

  return (
    <main>
      <div className="form-container">
        <h1>Register</h1>
        <form onSubmit={handleSubmit}>
          <input
            onInput={(e) => {
              setUsername(e.target.value);
            }}
            required
            type="text"
            name="username"
            placeholder="Enter username"
          />
          <input
            onInput={(e) => {
              setEmail(e.target.value);
            }}
            required
            type="email"
            name="email"
            placeholder="Enter email"
          />
          <input
            onInput={(e) => {
              setPassword(e.target.value);
            }}
            required
            type="password"
            name="password"
            placeholder="Enter password"
          />
          <button className="button primary-button" type="submit">Register</button>
        </form>

        <p>
          Already have an account?{" "}
          <Link className="toggleAuthForm" to="/login">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
};

export default Register;
