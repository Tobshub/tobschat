import { useState } from "react";
import AuthForm from "./components/auth-form";
import { Link, useNavigate } from "react-router-dom";
import { trpc } from "@utils/trpc";
import { setToken } from "@utils/token";

export function SignUpPage() {
  const [userProps, setUserProps] = useState({ username: "", email: "", password: "" });

  const handleChange = (name: string, content: string) => setUserProps((state) => ({ ...state, [name]: content }));

  const [formError, setFormError] = useState("");

  const navigate = useNavigate();

  const signupMut = trpc.user.new.useMutation({
    onSuccess(res) {
      if (res.ok) {
        setToken(res.value);
        navigate("/");
      } else {
        setFormError(res.message);
      }
    },
  });

  return (
    <AuthForm next={() => signupMut.mutate(userProps)} title="Sign Up">
      {formError ? <small className="alert alert-danger py-1">{formError}</small> : null}
      <div className="form-group mb-3">
        <label>Username:</label>
        <input className="form-control" required onChange={(e) => handleChange("username", e.target.value)} />
      </div>
      <div className="form-group mb-3">
        <label>Email:</label>
        <input
          required
          className="form-control"
          type="email"
          placeholder="user@example.com"
          onChange={(e) => handleChange("email", e.target.value)}
        />
      </div>
      <div className="form-group mb-3">
        <label>Password:</label>
        <input
          className="form-control"
          type="password"
          onChange={(e) => handleChange("password", e.target.value)}
          required
          minLength={8}
          maxLength={64}
        />
      </div>
      <small style={{ display: "block" }}>
        Already have an account? <Link to={"../login"}>Log In</Link> instead.
      </small>
      <button type="submit" className="btn btn-outline-success" disabled={signupMut.isLoading}>
        Sign Up
      </button>
    </AuthForm>
  );
}

