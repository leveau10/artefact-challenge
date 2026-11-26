import Link from "next/link";
import { primaryButton } from "@/components/button-styles";

export default function NotFound() {
  return (
    <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-6 text-center">
      <h1 className="text-lg font-semibold">Page not found</h1>
      <p className="text-sm text-gray-600">This page doesn&apos;t exist.</p>
      <Link href="/" className={primaryButton}>
        Back to tasks
      </Link>
    </div>
  );
}
