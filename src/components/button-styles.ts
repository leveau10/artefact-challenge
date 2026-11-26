const base =
  "inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 " +
  "disabled:cursor-not-allowed disabled:opacity-60";

export const primaryButton = `${base} bg-blue-600 text-white hover:bg-blue-700`;
export const secondaryButton = `${base} border border-gray-300 bg-white text-gray-800 hover:bg-gray-100`;
export const dangerButton = `${base} bg-red-600 text-white hover:bg-red-700`;