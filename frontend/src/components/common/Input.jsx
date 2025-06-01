const Input = ({
  id,
  name,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  error,
  ...props
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label
          htmlFor={id || name}
          className="block text-sm font-medium text-text-default mb-1"
        >
          {label}
        </label>
      )}
      <input
        id={id || name}
        name={name}
        type={type}
        required={required}
        className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
          error ? "border-error" : "border-gray-300"
        } placeholder-text-muted text-text-default focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...props}
      />
      {error && <p className="text-error text-xs mt-1">{error}</p>}
    </div>
  );
};
export default Input;