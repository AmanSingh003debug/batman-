import Layout from "../components/Layout";
import BatLogo from "../components/BatLogo";
import Link from "next/link";

export default function NotFound() {
  return (
    <Layout title="404">
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <BatLogo size={80} glow />
        <div className="font-cinzel" style={{ color: "#f5c518", fontSize: 48, fontWeight: 900, margin: "24px 0 8px" }}>404</div>
        <div style={{ color: "#555", fontFamily: "Rajdhani", fontSize: 16, marginBottom: 28 }}>This page escaped to Arkham.</div>
        <Link href="/" style={{ padding: "10px 28px", background: "#f5c518", color: "#0a0a0a", textDecoration: "none", fontFamily: "Cinzel, serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", borderRadius: 4 }}>
          RETURN TO BASE
        </Link>
      </div>
    </Layout>
  );
}
