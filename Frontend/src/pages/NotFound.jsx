import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 bg-canvas">
      <div className="text-center max-w-sm">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-5 bg-primary">
          <Compass size={20} className="text-white" />
        </div>
        <h1 className="font-semibold text-3xl mb-2 text-ink">404</h1>
        <p className="text-sm mb-6 text-ink-muted">Page Not Found</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-lg text-white bg-primary hover:bg-primary-hover transition-colors"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}