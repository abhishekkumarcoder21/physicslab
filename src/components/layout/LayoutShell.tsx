"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

/** Routes that use the immersive full-screen layout (no sidebar/topbar) */
const immersiveRoutes = ["/kinematics"];

export default function LayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isImmersive = immersiveRoutes.some((r) => pathname.startsWith(r));

  if (isImmersive) {
    return <>{children}</>;
  }

  return (
    <>
      <Sidebar />
      <div className="lg:pl-64 min-h-screen flex flex-col">
        <TopBar progress={12} />
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </>
  );
}
