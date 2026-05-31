import { ReactNode } from "react";
import Head from "next/head";
import Navbar from "./Navbar";

export default function Layout({ children, title = "Bat Tracker" }: { children: ReactNode; title?: string }) {
  return (
    <>
      <Head>
        <title>{title} — Bat Tracker</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0a0a0a" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      <div style={{ minHeight: "100vh", background: "#0a0a0a" }}>
        <Navbar />
        <main style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
          {children}
        </main>
      </div>
    </>
  );
}
