import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Complico – AI Compliance Copilot",
  description: "SOC2 readiness in days, not months.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: "#131a21", color: "#e5e7eb", border: "1px solid rgba(255,255,255,0.06)" },
          }}
        />
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}