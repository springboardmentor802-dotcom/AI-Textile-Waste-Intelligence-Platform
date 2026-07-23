import clsx from "clsx";

export const inputVariants = ({
  error,
  disabled,
  leftIcon,
  rightIcon,
}) =>
  clsx(
    // Base styles
    "w-full",
    "py-3",
    "rounded-xl",
    "outline-none",
    "transition-all",
    "duration-300",
    "text-sm",
    "placeholder:text-gray-400",

    // Padding based on icons
    {
      "pl-12": leftIcon,
      "pl-4": !leftIcon,

      "pr-12": rightIcon,
      "pr-4": !rightIcon,
    },

    // Disabled
    {
      "opacity-60 cursor-not-allowed": disabled,
    },

    // Focus
    "focus:ring-2",
    "focus:ring-offset-1"
  );