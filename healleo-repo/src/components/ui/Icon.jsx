const BASE_PATH = "/assets/icons/";
const CACHE_BUST = "?v=5";

export function Icon({ name, size = 18, className, style, alt }) {
  const isDark = typeof document !== "undefined" && document.documentElement.dataset.theme === "dark";
  return (
    <img
      src={`${BASE_PATH}${name}.svg${CACHE_BUST}`}
      width={size}
      height={size}
      alt={alt || name}
      className={className}
      style={{
        display: "inline-block",
        verticalAlign: "-3px",
        filter: isDark ? "invert(0.85) hue-rotate(180deg)" : "none",
        ...style,
      }}
    />
  );
}
