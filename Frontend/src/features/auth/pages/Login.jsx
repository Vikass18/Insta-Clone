import React, { useState } from "react";
import "../style/form.scss";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const {user, handleLogin , loading} = useAuth()
  const navigate = useNavigate()

  if (loading){
    return(
      <h1>Loading...</h1>
    )
  }

  function handleSubmit(e) {
    e.preventDefault();

    handleLogin(username , password)
    .then(res=>{
      console.log(res)
      navigate("/")
    })

  }

  return (
    <main>
      <div className="form-container">
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <input
            required
            type="text"
            name="username"
            placeholder="Enter username"
            value={username}
            onInput={(e) => setUsername(e.target.value)}
          />
          <input
           required
            type="password"
            name="password"
            placeholder="Enter password"
            value={password}
            onInput={(e) => setPassword(e.target.value)}
          />
          <button className="button primary-button" type="submit">Login</button>

          <p>
            Don't have an account?{" "}
            <Link className="toggleAuthForm" to="/register">
              Register
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
};

export default Login;
