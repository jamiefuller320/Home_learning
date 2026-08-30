import type { ElementType, ReactNode } from "react";

type PackProseProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
};

/** Shared wrapping for parent-facing pack copy — pretty line breaks everywhere. */
export function PackProse({ children, className = "", as: Component = "div" }: PackProseProps) {
  return <Component className={`text-pretty ${className}`.trim()}>{children}</Component>;
}
