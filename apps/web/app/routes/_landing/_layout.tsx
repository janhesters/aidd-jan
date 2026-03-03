import { cn } from "@workspace/ui/lib/utils";
import { Outlet } from "react-router";

import { Footer } from "./+/footer";
import { Header } from "./+/header";

export default function LandingLayout() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden px-4 supports-[overflow:clip]:overflow-clip">
      <Header />
      <main
        className={cn(
          "relative mx-auto max-w-4xl grow",
          "before:bg-border before:absolute before:-inset-y-14 before:-left-px before:w-px",
          "after:bg-border after:absolute after:-inset-y-14 after:-right-px after:w-px",
        )}
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
