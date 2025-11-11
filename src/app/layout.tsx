import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from 'react-hot-toast';
import ChatBot from "@/components/chatbot/ChatBot";

<Toaster
  position="top-right"
  toastOptions={{
    // Default styles
    style: {
      background: '#333',
      color: '#fff',
      fontSize: '14px',
      borderRadius: '8px',
      padding: '12px 16px',
    },
    // Success toast
    success: {
      style: {
        background: '#22c55e', // Tailwind green-500
      },
    },
    // Error toast
    error: {
      style: {
        background: '#ef4444', // Tailwind red-500
      },
    },
  }}
/>

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
          <main className="flex-grow w-full">{children}</main>
          <ChatBot />
        </AuthProvider>
      </body>
    </html>
  );
}
