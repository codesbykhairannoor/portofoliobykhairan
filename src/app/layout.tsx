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
  metadataBase: new URL("https://khairan.tech"),
  title: {
    default: "Khairan | AI, DevOps, & Software Engineering Expert Portfolio",
    template: "%s | Khairan - AI, DevOps & Engineering"
  },
  description: "Explore the professional portfolio of Khairan, an elite specialist in Artificial Intelligence systems, DevOps automation pipelines, cloud architecture, and modern full-stack software engineering. View production-ready case studies, AI architectures, and interactive tools.",
  keywords: [
    "Khairan",
    "Khairan tech",
    "AI Expert",
    "DevOps Specialist",
    "Software Engineering Specialist",
    "Artificial Intelligence Engineer",
    "DevOps Automation Engineer",
    "Kubernetes CI CD",
    "Cloud Architect",
    "Laravel Inertia",
    "Next.js React",
    "Full Stack Developer"
  ],
  authors: [{ name: "Khairan", url: "https://khairan.tech" }],
  creator: "Khairan",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://khairan.tech",
    siteName: "Khairan Portfolio",
    title: "Khairan | AI, DevOps, & Software Engineering Expert Portfolio",
    description: "In-depth showcase of elite AI model deployments, automated DevOps workflows, and enterprise-grade software engineering solutions crafted by Khairan.",
    images: [
      {
        url: "/favicon.ico",
        width: 512,
        height: 512,
        alt: "Khairan AI, DevOps, & Software Engineering",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Khairan | AI, DevOps, & Software Engineering Expert Portfolio",
    description: "In-depth showcase of elite AI model deployments, automated DevOps workflows, and enterprise-grade software engineering solutions crafted by Khairan.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
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
