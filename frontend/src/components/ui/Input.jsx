function Input({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
}) {
  return (
    <div className="mb-5">
      <label className="block text-gray-700 font-medium mb-2">
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-600"
      />
    </div>
  );
}

export default Input;