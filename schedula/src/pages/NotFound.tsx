import React from "react";
import { useRouter } from "next/navigation";

const NotFound = () => {
  const router = useRouter();

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="error-container">
      <div className="error-content">
        <h1 className="error-code">404</h1>
        <h2 className="error-title">Page Not Found</h2>
        <p className="error-message">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="error-actions">
          <button className="btn btn-primary" onClick={handleGoHome}>
            Go Home
          </button>
          <div className="text-sm text-gray-500">
            or{" "}
            <a href="#" className="auth-link" onClick={() => router.back()}>
              go back
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
