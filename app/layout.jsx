import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider, GoogleOneTap } from "@clerk/nextjs";
import AnimatedBackground from "./_components/AnimatedBackground";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased relative`}>
          <GoogleOneTap />
          
          {/* Animated Background */}
          <AnimatedBackground />

          {/* Content above background */}
          <div className="relative z-10 min-h-screen">
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}

