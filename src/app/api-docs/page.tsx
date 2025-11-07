"use client";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function ApiDocsPage() {
  const specUrl = "/api/swagger";
  return (
    <div className="min-h-screen bg-white py-6">
      <div className="mx-auto max-w-[95%]">
        <h1 className="text-2xl font-semibold mb-4">API Documentation</h1>
        <SwaggerUI
          url={specUrl}
          docExpansion="none"
          defaultModelsExpandDepth={-1}
        />
      </div>
    </div>
  );
}
