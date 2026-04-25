const BASE_PATH = "/assets/icons/";
const CACHE_BUST = "?v=3";

export function Icon({ name, size = 18, className, style, alt }) {
  return (
    <img
      src={`${BASE_PATH}${name}.svg${CACHE_BUST}`}
      width={size}
      height={size}
      alt={alt || name}
      className={className}
      style={{ display: "inline-block", verticalAlign: "-3px", ...style }}
    />
  );
}
