export function MiniBar({ values, max, color, labels }) {
  const h = 80;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: h }}>
      {values.map((v, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <div
            style={{
              width: "100%",
              maxWidth: 32,
              height: max > 0 ? Math.max(2, (v / max) * h) : 2,
              background: v > 0 ? color : "var(--muted)",
              borderRadius: 4,
              transition: "height 0.5s ease",
            }}
          />
          <span style={{ fontSize: 15, color: "var(--dim)", fontFamily: "var(--mono)" }}>{labels?.[i] || ""}</span>
        </div>
      ))}
    </div>
  );
}
