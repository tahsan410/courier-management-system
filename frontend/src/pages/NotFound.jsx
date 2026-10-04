import { Link } from "react-router-dom";
import { FiArrowRight, FiHome } from "react-icons/fi";
import useDocumentTitle from "../hooks/useDocumentTitle";

export default function NotFound() {
  useDocumentTitle("Page not found");

  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      <p className="bg-gradient-to-r from-brand-500 to-accent-500 bg-clip-text text-8xl font-extrabold text-transparent sm:text-9xl">
        404
      </p>
      <h1 className="mt-4 text-2xl font-extrabold text-slate-900 sm:text-3xl">
        This parcel got lost on the way
      </h1>
      <p className="mt-3 max-w-md text-slate-500">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn btn-primary btn-lg">
          <FiHome /> Back to home
        </Link>
        <Link to="/track" className="btn btn-secondary btn-lg">
          Track a parcel <FiArrowRight />
        </Link>
      </div>
    </div>
  );
}
