import type { Metadata } from "next";
import "./globals.css";

import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "ProjectHub — A place to display your masterpiece",
  description:
    "Curated registry for college department innovation: web apps, Android APKs, AI models, and robotics. Built for students, judges, and visitors.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen bg-[#F5F5F5] text-[#111215] selection:bg-[#FF4A38] selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
