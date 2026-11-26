import type { Metadata } from "next";
import { Toaster } from "sonner";
import { TRPCReactProvider } from "@/trpc/client";
import "./globals.css";

export const metadata: Metadata = {
  title: "Personal Task Manager System",
  description: "A task manager built with Next.js and tRPC for a challenge",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <TRPCReactProvider>
          <main className="mx-auto max-w-2xl px-4 py-10">{children}</main>
        </TRPCReactProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}