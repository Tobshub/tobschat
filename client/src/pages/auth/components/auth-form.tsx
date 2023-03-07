import { PropsWithChildren } from "react";
import "./auth-form.scss";

export default function AuthForm(props: PropsWithChildren & { title: string; next: (...args: any) => void }) {
  return (
    <div className="page auth-form">
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

