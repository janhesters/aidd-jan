import { cn } from "@workspace/ui/lib/utils";
import { Outlet } from "react-router";

import { Footer } from "./+/footer";
import { Header } from "./+/header";

export default function LandingLayout() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden px-4 supports-[overflow:clip]:overflow-clip">
      <div
        className={cn(
          "relative mx-auto flex w-full max-w-4xl grow flex-col",
          "before:bg-border before:absolute before:inset-y-0 before:-left-px before:w-px",
          "after:bg-border after:absolute after:inset-y-0 after:-right-px after:w-px",
        )}
      >
        <Header />
        <main className="grow">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
