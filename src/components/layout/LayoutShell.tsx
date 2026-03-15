"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import StarfieldBackground from "@/components/simulation/StarfieldBackground";

/** Routes that use full-screen immersive layout (own background, no sidebar) */
const fullImmersiveRoutes = ["/kinematics"];

/** Auth routes — starfield background but no sidebar/topbar */
const authRoutes = ["/login", "/signup"];

export default function LayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isFullImmersive = fullImmersiveRoutes.some((r) => pathname.startsWith(r));
  const isAuth = authRoutes.some((r) => pathname.startsWith(r));

  // Kinematics: completely own layout
  if (isFullImmersive) {
    return <>{children}</>;
  }

  // Auth pages: starfield background, no sidebar/topbar
  if (isAuth) {
    return (
      <>
        <div className="fixed inset-0 z-0">
          <StarfieldBackground height="100vh" count={600} speed={0.1} />
        </div>
        <div className="relative z-10">{children}</div>
      </>
    );
  }

  // Normal pages: starfield + sidebar + topbar
  return (
    <>
      <div className="fixed inset-0 z-0">
        <StarfieldBackground height="100vh" count={800} speed={0.15} />
      </div>

      <Sidebar />
      <div className="lg:pl-64 min-h-screen flex flex-col relative z-10">
        <TopBar progress={12} />
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </>
  );
}
