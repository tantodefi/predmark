import type { Metadata } from "next";
import { Inter } from "next/font/google";
import WagmiProviderWrapper from "@/context/WagmiProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Prediction Markets on LUKSO",
  description: "Create and participate in prediction markets using LUKSO"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-[#070E1B]">
      <body className={inter.className}>
        <WagmiProviderWrapper>
          {children}
        </WagmiProviderWrapper>
      </body>
    </html>
  );
}
