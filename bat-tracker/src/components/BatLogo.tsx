export default function BatLogo({ size = 40, glow = false }: { size?: number; glow?: boolean }) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 100 60" fill="none"
      style={glow ? { filter: "drop-shadow(0 0 8px rgba(245,197,24,0.7))" } : {}}>
      <path d="M50 8C50 8 42 2 30 4C18 6 8 14 2 20C8 18 16 20 20 24C14 26 10 32 10 38C16 32 24 30 28 34C26 38 26 44 30 48C32 42 38 38 50 36C62 38 68 42 70 48C74 44 74 38 72 34C76 30 84 32 90 38C90 32 86 26 80 24C84 20 92 18 98 20C92 14 82 6 70 4C58 2 50 8 50 8Z" fill="#f5c518"/>
      <ellipse cx="50" cy="52" rx="8" ry="4" fill="#f5c518"/>
    </svg>
  );
}
