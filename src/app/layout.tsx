import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import ToastProvider from "@/components/ui/ToastProvider";
import RootLayoutClient from "./layout-client";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: 'SSG Hub - Sejong Cybersecurity Group',
  description: 'A dynamic cybersecurity-focused platform for informations, managing projects and articles',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <RootLayoutClient>{children}</RootLayoutClient>
          <ToastProvider />
        </AuthProvider>
      </body>
    </html>
  );
}
