import { Ubuntu, Inter } from "next/font/google";
import "./globals.css";

const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata = {
  title: "Pentex",
  description: "Office Lunch Menu Management System",
};

export default function RootLayout({ children }) {
  return (
    <>
      <html lang="en" data-theme="dark">
        <body className={ubuntu.className || inter.className}>{children}</body>
      </html>
    </>
  );
}
