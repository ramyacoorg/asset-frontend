import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Assentra — IT Asset Management",
  description: "Assentra is a modern IT asset management platform for tracking, assigning, and maintaining assets across your organization.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: "system-ui, -apple-system, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
