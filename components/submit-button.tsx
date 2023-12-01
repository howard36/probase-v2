import { cn } from "@/utils/utils";

interface SpinnerProps {
  visible: boolean;
  size?: "sm" | "md";
}

const Spinner = ({ visible, size }: SpinnerProps) => (
  <div
    className={cn(size === "sm" ? "h-5 w-5 border-2" : "h-6 w-6 border-[3px]",
      visible ? "animate-spin rounded-full border-solid border-white/80 border-t-transparent" : "border-transparent")}
  ></div>
);

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isSubmitting: boolean;
  size?: "sm" | "md";
}

export default function SubmitButton({
  isSubmitting,
  size = "md",
  className,
  children,
  ...props
}: SubmitButtonProps) {
  return (
    <button
      disabled={isSubmitting}
      aria-disabled={isSubmitting}
      aria-busy={isSubmitting}
      className={cn(
        "rounded-lg text-white font-semibold border-0 inline-flex items-center justify-center",
        size === "sm" ? "gap-x-1.5 py-2 px-2.5 text-base" : "gap-x-3 py-2 px-4 text-lg",
        "shadow hover:shadow-md active:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 disabled:pointer-events-none",
        "transition-colors ease-in-out duration-150",
        "bg-sky-500 hover:bg-sky-600 active:bg-sky-700 shadow-sky-500/20 hover:shadow-sky-500/20  focus-visible:ring-sky-300 active:shadow-sky-500/20 disabled:bg-sky-300",
        className
      )}
      {...props}
    >
      <Spinner visible={isSubmitting} size={size} />
        {children}
      <Spinner visible={false} size={size} />
    </button>
  );
}
