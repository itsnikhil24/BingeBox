import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4">404</h1>
        <p className="text-gray-400 mb-6">Page not found</p>

        <Link
          to="/"
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;