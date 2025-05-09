import { Analytics } from "@vercel/analytics/react";
import { Inter } from "next/font/google";
import JsonLdSchema from "../components/JsonLdSchema";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "TeamWorks - Collaborative Team Work Tracking",
  description:
    "Efficient team work tracking and task management solution. Organize, track, and manage your team's tasks with our intuitive Kanban board system.",
  keywords: [
    "team work tracking",
    "task management",
    "kanban board",
    "team collaboration",
    "project management",
    "task tracking",
    "team productivity",
  ],
  authors: [{ name: "TeamWorks" }],
  creator: "TeamWorks",
  publisher: "TeamWorks",
  openGraph: {
    title: "TeamWorks - Collaborative Team Work Tracking",
    description:
      "Efficient team work tracking and task management solution. Organize, track, and manage your team's tasks with our intuitive Kanban board system.",
    url: "https://teamwork-six.vercel.app/",
    siteName: "TeamWorks",
    images: [
      {
        url: "/teamworks.png",
        width: 1200,
        height: 630,
        alt: "TeamWorks - Team Work Tracking App",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TeamWorks - Collaborative Team Work Tracking",
    description:
      "Efficient team work tracking and task management solution. Organize, track, and manage your team's tasks with our intuitive Kanban board system.",
    images: ["/teamworks.png"],
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
  alternates: {
    canonical: "https://teamwork-six.vercel.app/",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} antialiased bg-gray-50 text-gray-900`}>
        <Analytics />
        <JsonLdSchema />
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
