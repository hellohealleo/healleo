const BASE_PATH = "/assets/icons/";

export function Icon({ name, size = 18, className, style, alt }) {
  return (
    <img
      src={`${BASE_PATH}${name}.svg`}
      width={size}
      height={size}
      alt={alt || name}
      className={className}
      style={{ display: "inline-block", verticalAlign: "-3px", ...style }}
    />
  );
}
