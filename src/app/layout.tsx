import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FormCraft",
  description: "A polished no-code form builder for product teams."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
