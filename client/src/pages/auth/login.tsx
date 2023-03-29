import { useLayoutEffect, useRef, useState } from "react";
import AuthForm, { ButtonWithLoader } from "./components/auth-form";
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
        setToken(res.value);
        navigate("/");
      } else {
        setFormError("Email or Password is wrong");
      }
    },
    onError() {
      setFormError("An error occured! Please try again later");
    },
  });

  const emailInputRef = useRef<HTMLInputElement>(null);
  // focus email input on first render
  useLayoutEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, []);

  return (
    <AuthForm next={() => loginMut.mutate(userProps)} title="Log In">
      {formError ? <small className="alert alert-danger py-1">{formError}</small> : null}
      <div className="form-group mb-3">
        <label>Email:</label>
        <input
          ref={emailInputRef}
          className="form-control"
          type="email"
          placeholder="user@example.com"
          onChange={(e) => handleChange("email", e.target.value)}
          required
        />
      </div>
      <div className="form-group mb-3">
        <label>Password:</label>
        <input
          className="form-control"
          type="password"
          required
          onChange={(e) => handleChange("password", e.target.value)}
        />
      </div>
      <small style={{ display: "block" }}>
        Don't have an account? <Link to={"../sign-up"}>Sign Up</Link> instead.
      </small>
      <ButtonWithLoader disabled={loginMut.isLoading}>
        Log In
      </ButtonWithLoader>
    </AuthForm>
  );
}

