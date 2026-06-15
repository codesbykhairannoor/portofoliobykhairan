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

import { Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#030303",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://khairan.tech"),
  title: {
    default: "Khairan Noor Fadhlillah | AI, DevOps, & Software Engineering Expert Portfolio",
    template: "%s | Khairan Noor Fadhlillah"
  },
  description: "Explore the professional portfolio of Khairan Noor Fadhlillah, an elite specialist in Artificial Intelligence systems, DevOps automation pipelines, cloud architecture, and modern full-stack software engineering based in Indonesia.",
  keywords: [
    "Khairan Noor Fadhlillah",
    "Khairan Noor Fadhlillah Portfolio",
    "Khairan tech",
    "Best AI Engineer Indonesia",
    "AI Agent Specialist Indonesia",
    "Top DevOps Specialist Indonesia",
    "Senior Software Engineer Jakarta",
    "Expert Software Engineering Specialist",
    "Next.js React Development Indonesia",
    "Full Stack Web Developer Jakarta",
    "Konsultan AI Indonesia",
    "Jasa Pembuatan Website Profesional"
  ],
  authors: [{ name: "Khairan Noor Fadhlillah", url: "https://khairan.tech" }],
  creator: "Khairan Noor Fadhlillah",
  publisher: "Khairan Noor Fadhlillah",
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
    canonical: "https://khairan.tech",
  },
  other: {
    "geo.region": "ID-JK",
    "geo.placename": "Jakarta",
    "geo.position": "-6.2088;106.8456",
    "ICBM": "-6.2088, 106.8456",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://khairan.tech",
    siteName: "Khairan Noor Fadhlillah Portfolio",
    title: "Khairan Noor Fadhlillah | Premium Web & AI Solutions",
    description: "Professional portfolio showcasing elite AI deployments, automated DevOps workflows, and enterprise-grade software engineering solutions by Khairan Noor Fadhlillah.",
    images: [
      {
        url: "/favicon.ico",
        width: 512,
        height: 512,
        alt: "Khairan Noor Fadhlillah",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Khairan Noor Fadhlillah | AI & Engineering Expert",
    description: "Discover top-tier digital ecosystems, AI autonomous agents, and enterprise web applications.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Khairan Noor Fadhlillah",
    "url": "https://khairan.tech",
    "jobTitle": "AI & DevOps Engineering Specialist",
    "alumniOf": "Universitas Ahmad Dahlan",
    "knowsAbout": ["Artificial Intelligence", "DevOps", "Software Engineering", "Cloud Computing", "Next.js", "Laravel"],
    "sameAs": [
      "https://github.com/codesbykhairannoor",
      "https://www.linkedin.com/in/khairannoorfadhlillah/",
      "https://instagram.com/khairannoor.f"
    ]
  };

  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const storedTheme = localStorage.getItem('theme');
                  const supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (storedTheme === 'light' || (!storedTheme && !supportDarkMode)) {
                    document.documentElement.classList.add('light');
                  } else {
                    document.documentElement.classList.remove('light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
