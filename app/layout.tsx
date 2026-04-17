import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SpeechWhiz | SLP Worksheet Generator",
  description:
    "Turn current-events stories into speech-language therapy reading comprehension worksheets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
