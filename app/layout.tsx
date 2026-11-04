import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HackerSpace Nodo Serrano",
  description:
    "Un espacio de Nodo Serrano para aprender, experimentar y construir en comunidad desde Tandil.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-AR">
      <body>{children}</body>
    </html>
  );
}
