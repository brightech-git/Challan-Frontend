"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Login } from "../../services/authServices";

export default function LoginScreen() {
  const [login, setLogin] = useState(null);

  const router = useRouter();

  const [formLogin, setFormLogin] = useState({
    name: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormLogin((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    console.log("FORM DATA:", formLogin);

    try {
      const response = await Login(formLogin);

      console.log("LOGIN RESPONSE:", response);

      setLogin(response);

      router.push("/Dashboard");

    } catch (error) {
      console.error("LOGIN FAILED:", error);
    }
  };
  

  return (
    <>
      <div className="login-page">
        <div className="login-card">

          <div className="login-header">
            <h1>Login</h1>
            <p>Enter your username and password</p>
          </div>

          <form onSubmit={handleLogin}>

            <div className="input-group">
              <label>Username</label>

              <input
                type="text"
                name="name"
                value={formLogin.name}
                onChange={handleChange}
                placeholder="Enter username"
              />
            </div>

            <div className="input-group">
              <label>Password</label>

              <input
                type="password"
                name="password"
                value={formLogin.password}
                onChange={handleChange}
                placeholder="Enter password"
              />
            </div>

            <button type="submit" className="login-button">
              Login
            </button>

          </form>

          {login && (
            <div className="success-message">
              Login successful
            </div>
          )}

        </div>
      </div>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .login-page {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #e8f0ff, #f8faff);
          padding: 20px;
        }

        .login-card {
          width: 100%;
          max-width: 420px;
          background: #ffffff;
          padding: 40px;
          border-radius: 16px;
          box-shadow: 0 10px 35px rgba(0, 0, 0, 0.12);
        }

        .login-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .login-header h1 {
          margin: 0;
          font-size: 30px;
          color: #222222;
          font-weight: 700;
        }

        .login-header p {
          margin-top: 8px;
          color: #777777;
          font-size: 15px;
        }

        .input-group {
          margin-bottom: 22px;
        }

        .input-group label {
          display: block;
          margin-bottom: 8px;
          color: #333333;
          font-size: 15px;
          font-weight: 600;
        }

        .input-group input {
          width: 100%;
          height: 48px;
          padding: 0 14px;
          border: 1px solid #d4d8e0;
          border-radius: 8px;
          font-size: 15px;
          color: #222222;
          background: #ffffff;
          outline: none;
        }

        .input-group input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
        }

        .login-button {
          width: 100%;
          height: 48px;
          border: none;
          border-radius: 8px;
          background: #2563eb;
          color: #ffffff;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
        }

        .login-button:hover {
          background: #1d4ed8;
        }

        .success-message {
          margin-top: 20px;
          padding: 12px;
          border-radius: 8px;
          background: #dcfce7;
          color: #166534;
          text-align: center;
        }

        @media (max-width: 500px) {
          .login-card {
            padding: 30px 20px;
          }

          .login-header h1 {
            font-size: 26px;
          }
        }
      `}</style>
    </>
  );
}