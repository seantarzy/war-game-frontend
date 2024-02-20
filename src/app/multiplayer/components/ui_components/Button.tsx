export function BaseballButton({
  disabled,
  children,
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  disabled: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      disabled={disabled}
      className={`flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white ${
        disabled ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-700"
      } transition duration-150 ease-in-out ${className}`}
      {...rest}
    >
      <BaseballIcon className="mr-4" />
      {children}
    </button>
  );
}

const BaseballIcon = ({ className }: { className: string }) => (
  <svg
    id="bat"
    width="100"
    height="43"
    viewBox="0 0 337.4 42.6"
    className={className}
  >
    <path
      className="tan"
      d="M95.2 12.7c-36.4 1.4-74.9-0.2-85-0.7C8.9 7.1 6 7.3 6 7.3s-6 1-6 13.8 4.7 14.8 6.5 14.8c2.5 0 3.4-4.2 3.6-5.2 10.1-0.5 48.6-2.1 85-0.7 15.5 0.6 42.9 2 72 3.6V9.1C138 10.7 110.6 12.1 95.2 12.7z"
    />
    <path
      className="tan"
      d="M323 0.1c0 0-33.5 1.7-43.1 2.5 -5.3 0.5-47.8 3-92 5.4v26.6c44.2 2.4 86.7 4.9 92 5.4 9.6 0.8 43.1 2.5 43.1 2.5s14.4 2.5 14.4-21v-0.4C337.4-2.4 323 0.1 323 0.1z"
    />
    <path
      className="red"
      d="M167.1 9.1v24.3c6.9 0.4 13.8 0.7 20.8 1.1V8C181 8.4 174 8.7 167.1 9.1z"
    />
  </svg>
);
