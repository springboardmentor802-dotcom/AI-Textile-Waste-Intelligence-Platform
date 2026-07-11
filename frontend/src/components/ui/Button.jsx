function Button({
  children,
  type = "button",
  onClick,
  className = "",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 rounded-lg transition duration-300 ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;