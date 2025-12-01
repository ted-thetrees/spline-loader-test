import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spline Scene Load Tester",
  description: "Test loading times of Spline 3D scenes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
