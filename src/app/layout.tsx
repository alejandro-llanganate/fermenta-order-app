import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "sweetalert2/dist/sweetalert2.min.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { FontSizeProvider } from "@/contexts/FontSizeContext";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sistema de Gestión de pedidos",
  description: "Sistema inteligente de Gestión de pedidos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <Script
          src="https://cdn.jsdelivr.net/npm/sweetalert2@11"
          strategy="beforeInteractive"
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <FontSizeProvider>
            {children}
          </FontSizeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
