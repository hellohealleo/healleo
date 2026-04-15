export function RingProgress({ value, max, size = 64, stroke = 5, color }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = max > 0 ? Math.min(value / max, 1) : 0;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={c}
        strokeDashoffset={c * (1 - p)}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
    </svg>
  );
}
