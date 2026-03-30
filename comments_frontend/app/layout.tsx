import "./globals.css";
import { AuthProvider } from "./context/au_context";

export const metadata = {
  title: "Real-time Comments",
  description: "A real-time comment system with Socket.IO",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
