import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "¿Pasó en Argentina?",
  description:
    "Un juego para jugar con amigos y aprender sobre la historia argentina",
  keywords: [
    "argentina",
    "historia",
    "juego",
    "trivia",
    "conocimiento",
    "educativo",
    "amigos",
    "entretenimiento",
  ],
  authors: [{ name: "Paso en Argentina" }],
  creator: "Paso en Argentina",
  publisher: "Paso en Argentina",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://paso-en-argentina.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "¿Pasó en Argentina?",
    description:
      "Un juego para jugar con amigos y aprender sobre la historia argentina",
    url: "https://paso-en-argentina.com",
    siteName: "Paso en Argentina",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "¿Pasó en Argentina? - Juego de historia argentina",
      },
    ],
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "¿Pasó en Argentina?",
    description:
      "Un juego para jugar con amigos y aprender sobre la historia argentina",
    images: ["/og-image.png"],
    creator: "@chortjulio",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
