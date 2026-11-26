"use client";

import { useEffect } from "react";
import { primaryButton } from "@/components/button-styles";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-6">
      <h1 className="text-lg font-semibold text-red-800">Something went wrong</h1>
      <p className="text-sm text-red-700">
        An error occurred while loading this page.
      </p>
      <button type="button" className={primaryButton} onClick={reset}>
        Try again
      </button>
    </div>
  );
}