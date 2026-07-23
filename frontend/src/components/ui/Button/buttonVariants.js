// buttonVariants.js

import clsx from "clsx";

export const buttonVariants = ({
  variant = "primary",
  size = "md",
  disabled = false,
}) =>
  clsx(
    "inline-flex items-center justify-center",
    "font-semibold",
    "transition-all duration-300",
    "rounded-xl",

    // Sizes
    {
      "px-3 py-2 text-sm": size === "sm",
      "px-5 py-3 text-base": size === "md",
      "px-7 py-4 text-lg": size === "lg",
    },

    // Disabled
    {
      "opacity-50 cursor-not-allowed": disabled,
    }
  );