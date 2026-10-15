import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  alt?: string;
};

export function Logo({ className, alt = "Lex Laboral" }: LogoProps) {
  return (
    <>
      <img
        src="/logo.png"
        alt={alt}
        className={cn("object-contain dark:hidden", className)}
      />
      <img
        src="/logo-white.png"
        alt={alt}
        className={cn("object-contain hidden dark:block", className)}
      />
    </>
  );
}
