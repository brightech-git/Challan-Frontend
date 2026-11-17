import type { Metadata } from "next";
import localFont from "next/font/local";
import { Provider } from "@/components/ui/provider";
import { InlineScript } from "@/components/ui/inline-script";
import { THEME_INIT_SCRIPT } from "@/lib/theme-storage";
import "./globals.css";

// Local public assets supply the app-wide Chakra and Tailwind font tokens.
const poppins = localFont({
  variable: "--font-poppins",
  display: "swap",
  src: [
    { path: "../../public/fonts/Poppins/Poppins-Regular.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/Poppins/Poppins-Medium.ttf", weight: "500", style: "normal" },
    { path: "../../public/fonts/Poppins/Poppins-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../../public/fonts/Poppins/Poppins-Bold.ttf", weight: "700", style: "normal" },
    { path: "../../public/fonts/Poppins/Poppins-Italic.ttf", weight: "400", style: "italic" },
  ],
});

export const metadata: Metadata = {
  title: "Challan",
  description: "Challan management",
  icons: {
    icon: "/icon-rounded.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${poppins.variable} h-full antialiased`}
    >
      <head>
        {/* Sets the light/dark class on <html> before first paint, so
            there's no flash of the wrong theme. See
            components/ui/color-mode.tsx and lib/theme-storage.ts. */}
        <InlineScript html={THEME_INIT_SCRIPT} />
      </head>
      <body className="min-h-full flex flex-col">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
