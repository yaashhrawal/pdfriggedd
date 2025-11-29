import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Shell } from "@/components/layout/Shell";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PDF Rigged - Free Online PDF Tools for AI Workflows",
  description: "Merge, split, compress, and convert PDFs for free. Optimize your documents for ChatGPT, Claude, Gemini, and Perplexity.",
  keywords: ["PDF", "Merge PDF", "Split PDF", "Compress PDF", "PDF to JPG", "AI", "ChatGPT", "Claude", "Gemini", "Perplexity", "LLM"],
  openGraph: {
    title: "PDF Rigged - Free Online PDF Tools for AI Workflows",
    description: "Optimize your documents for ChatGPT, Claude, Gemini, and Perplexity.",
    type: "website",
    url: "https://pdfrigged.in",
    siteName: "PDF Rigged",
  },
  twitter: {
    card: "summary_large_image",
    title: "PDF Rigged - Free Online PDF Tools",
    description: "Optimize your documents for ChatGPT, Claude, Gemini, and Perplexity.",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "PDF Rigged",
  "applicationCategory": "ProductivityApplication",
  "operatingSystem": "Any",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
  },
  "description": "Free online PDF tools to merge, split, compress, and convert documents. Optimized for AI workflows.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AuthProvider>
          <Shell>{children}</Shell>
        </AuthProvider>
      </body>
    </html>
  );
}
