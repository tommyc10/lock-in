import type { Metadata } from "next";
import { Cormorant, DM_Sans } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/layout/Navigation";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

// Elegant serif for display and headings
const cormorant = Cormorant({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Clean modern sans-serif for body and UI
const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lock In",
  description: "Your personal habit tracker for consistent life improvement",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${dmSans.variable} ${cormorant.variable} antialiased`}>
        <ThemeProvider>
          {children}
          <Navigation />
          {/* Bottom padding for nav */}
          <div className="h-20" />
        </ThemeProvider>
      </body>
    </html>
  );
}
