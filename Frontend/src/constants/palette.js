/* ---------------------------------------------------------
   Single color source of truth for the whole app.
   Originally defined inline in Dashboard.jsx — pulled out here
   so any page (Dashboard, Sustainability Overview, Carbon
   Reduction, Waste Diversion, ...) can reuse the exact same
   teal / magenta / golden / lavender accent system instead of
   redefining it per file.
---------------------------------------------------------- */
export const PALETTE = {
  teal: {
    soft: '#E8F2F0',
    border: '#B9D6D0',
    icon: '#4A8C93',
    accent: '#63B0A5',
    text: '#1F4B4E',
    button: '#3E7A80',
  },
  magenta: {
    soft: '#F4E8EF',
    border: '#DDB8CA',
    icon: '#C874A2',
    accent: '#E287B8',
    text: '#7A2E52',
    button: '#B85F8F',
  },
  golden: {
    soft: '#FAF4D9',
    border: '#E7D67C',
    icon: '#B79A25',
    accent: '#EED45D',
    text: '#6B551A',
    button: '#B79A25',
  },
  lavender: {
    soft: '#EEEAF5',
    border: '#CFC4E3',
    icon: '#8D7EB4',
    accent: '#A696CD',
    text: '#4A3B6B',
    button: '#75649D',
  },
};

export const paletteVars = (colorKey) => {
  const p = PALETTE[colorKey] || PALETTE.teal;
  return {
    '--p-soft': p.soft,
    '--p-border': p.border,
    '--p-icon': p.icon,
    '--p-accent': p.accent,
    '--p-text': p.text,
    '--p-button': p.button,
  };
};