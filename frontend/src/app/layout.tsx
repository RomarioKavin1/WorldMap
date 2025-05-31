import { auth } from "@/auth";
import ClientProviders from "@/providers";
import "@worldcoin/mini-apps-ui-kit-react/styles.css";
import type { Metadata } from "next";
import { Josefin_Sans } from "next/font/google";
import "./globals.css";

const josefinSans = Josefin_Sans({
  variable: "--font-josefin-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "World Map - Explore the Digital Frontier",
  description:
    "A premium World Mini App for exploring the verified human network with cutting-edge security and lightning-fast interactions.",
  keywords: [
    "world map",
    "world id",
    "mini app",
    "blockchain",
    "verified humans",
    "digital identity",
  ],
  themeColor: "#000000",
  viewport:
    "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "World Map",
  },
  formatDetection: {
    telephone: false,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="en" className="dark">
      <body className={`${josefinSans.variable} bg-black text-white`}>
        <ClientProviders session={session}>{children}</ClientProviders>
      </body>
    </html>
  );
}
