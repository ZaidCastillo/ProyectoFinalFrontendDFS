import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Budget Manager",
  description: "Gestiona tu presupuesto: balance, ingresos y gastos, metas y huchas de ahorro.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased p-4`}
      >
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
