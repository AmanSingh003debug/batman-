import Link from "next/link";
import { useRouter } from "next/router";
import BatLogo from "./BatLogo";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/shift", label: "Shift" },
  { href: "/workout", label: "Workout" },
  { href: "/courses", label: "Courses" },
  { href: "/history", label: "History" },
];

export default function Navbar() {
  const { pathname } = useRouter();
  return (
    <nav style={{ background: "rgba(10,10,10,0.97)", borderBottom: "1px solid rgba(245,197,24,0.15)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 40 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <BatLogo size={34} glow />
          <span className="font-cinzel" style={{ color: "#f5c518", fontSize: 14, fontWeight: 700, letterSpacing: "0.2em" }}>BAT TRACKER</span>
        </Link>
        <div style={{ display: "flex", gap: 4 }}>
          {links.map((l) => (
            <Link key={l.href} href={l.href}
              className={`tab-btn ${pathname === l.href ? "active" : ""}`}
              style={{ textDecoration: "none", display: "block" }}>
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
