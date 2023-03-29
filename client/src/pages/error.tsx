import { Link, useRouteError } from "react-router-dom";

export function ErrorPage() {
  const error = useRouteError() as Error;
  return (
    <div>
      <h1>Oops! Something bad happened</h1>
      <small>{"message" in error? error.message : null}</small>
      <p>
        Don't panic. One of these solutions should work:
      </p>
      <ul>
        <li><Link to="/">Go to home</Link></li>
        <li><button className="btn btn-link p-0" onClick={() => window.location.reload()}>Reload the page</button></li>
      </ul>
    </div>
  )
}
