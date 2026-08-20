import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { loginUser, registerUser } from "../services/auth";
import "./AuthDialog.css";

function AuthDialog({
  open,
  onOpenChange,
  initialMode = "login",
}) {
  const navigate = useNavigate();

  const [mode, setMode] = useState(initialMode);

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const changeMode = (newMode) => {
    setMode(newMode);
  };

  const handleLoginChange = (e) => {
    setLoginForm({
      ...loginForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegisterChange = (e) => {
    setRegisterForm({
      ...registerForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const data = await loginUser(loginForm);

      if (!data.success) {
        alert(data.message);
        return;
      }

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      localStorage.setItem(
        "session",
        JSON.stringify(data.session)
      );

      onOpenChange(false);

      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Something went wrong while logging in.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const data = await registerUser(registerForm);

      if (!data.success) {
        alert(data.message);
        return;
      }

      alert("Registration successful!");

      // Keep the user on the same page.
      // Switch directly to the login form.
      setMode("login");

      setLoginForm({
        email: registerForm.email,
        password: "",
      });
    } catch (error) {
      console.error(error);
      alert("Something went wrong while creating the account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="auth-dialog">

        <DialogHeader className="auth-header">

          <DialogTitle className="auth-title">
            BINGEWATCH
          </DialogTitle>

          <DialogDescription className="auth-description">
            {mode === "login"
              ? "Sign in to continue watching"
              : "Create your account and start watching"}
          </DialogDescription>

        </DialogHeader>

        {mode === "login" ? (
          <form
            className="auth-form"
            onSubmit={handleLogin}
          >

            <div className="auth-field">
              <label>Email</label>

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={loginForm.email}
                onChange={handleLoginChange}
                required
              />
            </div>

            <div className="auth-field">
              <label>Password</label>

              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={loginForm.password}
                onChange={handleLoginChange}
                required
              />
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Login"}
            </button>

            <p className="auth-switch">
              Don't have an account?{" "}

              <button
                type="button"
                onClick={() => changeMode("register")}
              >
                Register
              </button>
            </p>

          </form>
        ) : (
          <form
            className="auth-form"
            onSubmit={handleRegister}
          >

            <div className="auth-field">
              <label>Full Name</label>

              <input
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                value={registerForm.fullName}
                onChange={handleRegisterChange}
                required
              />
            </div>

            <div className="auth-field">
              <label>Username</label>

              <input
                type="text"
                name="username"
                placeholder="Choose a username"
                value={registerForm.username}
                onChange={handleRegisterChange}
                required
              />
            </div>

            <div className="auth-field">
              <label>Email</label>

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={registerForm.email}
                onChange={handleRegisterChange}
                required
              />
            </div>

            <div className="auth-field">
              <label>Password</label>

              <input
                type="password"
                name="password"
                placeholder="Create a password"
                value={registerForm.password}
                onChange={handleRegisterChange}
                required
              />
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>

            <p className="auth-switch">
              Already have an account?{" "}

              <button
                type="button"
                onClick={() => changeMode("login")}
              >
                Login
              </button>
            </p>

          </form>
        )}

      </DialogContent>
    </Dialog>
  );
}

export default AuthDialog;