import { useState } from "react";
import AuthForm from "./components/auth-form";
import { Link, useNavigate } from "react-router-dom";
import { trpc } from "@utils/trpc";
import { setToken } from "@utils/token";

export function LoginPage() {
  const [userProps, setUserProps] = useState({ email: "", password: "" });

  const handleChange = (name: string, content: string) => setUserProps((state) => ({ ...state, [name]: content }));

  const [formError, setFormError] = useState("");

  const navigate = useNavigate();

  const loginMut = trpc.user.login.useMutation({
    onSuccess(res) {
      if (res.ok) {
        setToken(res.data);
        navigate("/");
      } else {
        setFormError("Email or Password is wrong");
      }
    },
  });

  return (
    <AuthForm next={() => loginMut.mutate(userProps)} title="Log In">
      {formError ? <small className="alert alert-danger py-1">{formError}</small> : null}
      <div className="form-group mb-3">
        <label>Email:</label>
        <input
          className="form-control"
          type="email"
          placeholder="user@example.com"
          onChange={(e) => handleChange("email", e.target.value)}
        />
      </div>
      <div className="form-group mb-3">
        <label>Password:</label>
        <input className="form-control" type="password" onChange={(e) => handleChange("password", e.target.value)} />
      </div>
      <p>
        Don't have an account? <Link to={"../sign-up"}>Sign Up</Link> instead.
      </p>
      <button className="btn btn-outline-success" disabled={loginMut.isLoading || loginMut.isSuccess}>
        Log In
      </button>
    </AuthForm>
  );
}

