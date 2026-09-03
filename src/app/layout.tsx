import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Provider } from "@/components/ui/provider";
import "./globals.css";

// App-wide typeface. The CSS variable this creates (--font-plus-jakarta-sans)
// is what theme/system.ts points Chakra's `heading`/`body` font tokens at,
// so every Chakra component (Text, Heading, Input, Button, ...) picks it up
// automatically — see that file's `fonts` block for the other half of this.
const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Challan",
  description: "Challan management",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
