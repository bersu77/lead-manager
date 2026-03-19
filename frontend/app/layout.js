import "./globals.css";

export const metadata = {
  title: "Lead Manager",
  description: "Simple Lead Manager",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
