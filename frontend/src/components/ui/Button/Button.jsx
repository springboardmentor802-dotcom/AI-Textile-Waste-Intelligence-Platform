import { buttonVariants } from "./buttonVariants";

const styles = {
  primary: {
    background: "var(--primary)",
    color: "#fff",
  },

  secondary: {
    background: "var(--surface)",
    color: "var(--primary)",
    border: "1px solid var(--primary)",
  },

  outline: {
    background: "transparent",
    color: "var(--text-primary)",
    border: "1px solid var(--border)",
  },

  danger: {
    background: "var(--danger)",
    color: "#fff",
  },
};

function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  onClick,
}) {
  return (
    <button
      disabled={disabled || loading}
      onClick={onClick}
      className={buttonVariants({
        variant,
        size,
        disabled,
      })}
      style={styles[variant]}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}

export default Button;