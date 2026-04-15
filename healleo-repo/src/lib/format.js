// Formatting helpers extracted from App.jsx.

export function fmtHeight(inches) {
  if (!inches) return "?";
  const ft = Math.floor(inches / 12);
  const inn = Math.round(inches % 12);
  return `${ft}'${inn}"`;
}
