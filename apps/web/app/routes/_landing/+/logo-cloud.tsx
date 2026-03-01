import { cn } from "@workspace/ui/lib/utils";
import type { ComponentProps, ReactNode } from "react";

import { DecorIcon } from "./decor-icon";

type Logo = {
  alt: string;
  src: string;
};

const logos: { className: string; children?: ReactNode; logo: Logo }[] = [
  {
    className: "relative border-r border-b bg-secondary dark:bg-secondary/30",
    children: <DecorIcon className="z-10" position="bottom-right" />,
    logo: {
      alt: "Nvidia Logo",
      src: "/images/logo/nvidia-wordmark.svg",
    },
  },
  {
    className: "border-b md:border-r",
    logo: {
      alt: "Supabase Logo",
      src: "/images/logo/supabase-wordmark.svg",
    },
  },
  {
    className:
      "relative border-r border-b md:bg-secondary dark:md:bg-secondary/30",
    children: (
      <>
        <DecorIcon className="z-10" position="bottom-right" />
        <DecorIcon className="z-10 hidden md:block" position="bottom-left" />
      </>
    ),
    logo: {
      alt: "GitHub Logo",
      src: "/images/logo/github-wordmark.svg",
    },
  },
  {
    className:
      "relative border-b bg-secondary md:bg-background dark:bg-secondary/30 md:dark:bg-background",
    logo: {
      alt: "OpenAI Logo",
      src: "/images/logo/openai-wordmark.svg",
    },
  },
  {
    className:
      "relative border-r border-b bg-secondary md:border-b-0 md:bg-background dark:bg-secondary/30 md:dark:bg-background",
    children: <DecorIcon className="z-10 md:hidden" position="bottom-right" />,
    logo: {
      alt: "Turso Logo",
      src: "/images/logo/turso-wordmark.svg",
    },
  },
  {
    className:
      "border-b bg-background md:border-r md:border-b-0 md:bg-secondary dark:md:bg-secondary/30",
    logo: {
      alt: "Clerk Logo",
      src: "/images/logo/clerk-wordmark.svg",
    },
  },
  {
    className: "border-r",
    logo: {
      alt: "Claude AI Logo",
      src: "/images/logo/claude-wordmark.svg",
    },
  },
  {
    className: "bg-secondary dark:bg-secondary/30",
    logo: {
      alt: "Vercel Logo",
      src: "/images/logo/vercel-wordmark.svg",
    },
  },
];

export function LogoCloud() {
  return (
    <div className="grid grid-cols-2 border md:grid-cols-4">
      {logos.map((item) => (
        <LogoCard
          className={item.className}
          key={item.logo.alt}
          logo={item.logo}
        >
          {item.children}
        </LogoCard>
      ))}
    </div>
  );
}

type LogoCardProps = ComponentProps<"div"> & {
  logo: Logo;
};

function LogoCard({ logo, className, children, ...props }: LogoCardProps) {
  return (
    <div
      className={cn(
        "bg-background flex items-center justify-center px-4 py-8 md:p-8",
        className,
      )}
      {...props}
    >
      <img
        alt={logo.alt}
        className="pointer-events-none h-4 select-none md:h-5 dark:brightness-0 dark:invert"
        height="auto"
        src={logo.src}
        width="auto"
      />
      {children}
    </div>
  );
}
