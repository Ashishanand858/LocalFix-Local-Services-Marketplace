import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center px-4 text-center">
      <div>
        <div className="text-6xl font-black">404</div>
        <h1 className="mt-3 text-2xl font-black">Page not found</h1>
        <Link className="btn-primary mt-6 inline-flex" to="/">
          Go home
        </Link>
      </div>
    </div>
  );
}
