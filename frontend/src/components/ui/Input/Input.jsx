import { inputVariants } from "./inputVariants";

function Input({
  id,
  name,
  label,
  type = "text",
  placeholder = "",
  value,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  autoComplete = "off",
  leftIcon,
  rightIcon,
  ...props
}) {
  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Label */}
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium"
          style={{ color: "var(--text-primary)" }}
        >
          {label}

          {required && (
            <span
              className="ml-1"
              style={{ color: "var(--danger)" }}
            >
              *
            </span>
          )}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div
            className="absolute left-4 top-1/2 -translate-y-1/2"
            style={{ color: "var(--text-secondary)" }}
          >
            {leftIcon}
          </div>
        )}

        {/* Input */}
        <input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          autoComplete={autoComplete}
          className={inputVariants({
            error,
            disabled,
            leftIcon,
            rightIcon,
          })}
          {...props}
        />

        {/* Right Icon */}
        {rightIcon && (
          <button
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
            style={{ color: "var(--text-secondary)" }}
          >
            {rightIcon}
          </button>
        )}
      </div>

      {/* Helper Text */}
      {!error && helperText && (
        <p
          className="text-xs"
          style={{ color: "var(--text-secondary)" }}
        >
          {helperText}
        </p>
      )}

      {/* Error */}
      {error && (
        <p
          className="text-xs font-medium"
          style={{ color: "var(--danger)" }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

export default Input;