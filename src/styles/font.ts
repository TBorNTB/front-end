import localFont from "next/font/local";

export const Inter = localFont({
  src: "../../public/fonts/InterVariable.woff2",
  display: "swap",
  weight: "100 900", // Inter variable font weight range
  variable: "--font-inter", // CSS variable matching your theme
});
