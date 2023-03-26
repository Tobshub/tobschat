import { PropsWithChildren } from "react";
import "./auth-form.scss";
import {MdCancel} from "react-icons/md"
import { useNavigate } from "react-router-dom";

export default function AuthForm(props: PropsWithChildren & { title: string; next: (...args: any) => void }) {
  const navigate = useNavigate();

  return (
    <div className="auth-form">
      <div style={{position: "absolute", top: "1rem", left: "1rem",}}>
        <button className="btn btn-outline fs-1" onClick={() => navigate("/about")}>
          <MdCancel />
        </button>
      </div>
      <h1 style={{ textAlign: "center" }}>{props.title}</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          props.next();
        }}
      >
        {props.children}
      </form>
    </div>
  );
}

