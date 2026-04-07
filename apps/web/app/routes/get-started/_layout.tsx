import { Outlet } from "react-router";

import { LogoIcon } from "~/routes/_landing/+/logo";

export default function GetStartedLayout() {
  return (
    <div className="bg-muted/30 flex min-h-screen flex-col items-center px-4 py-8">
      <LogoIcon className="mb-8 h-10 w-10" />
      <Outlet />
    </div>
  );
}
