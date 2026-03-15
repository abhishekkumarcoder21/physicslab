import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kinematics — Explore Motion | PhysicsLab",
  description:
    "An immersive journey through kinematics: motion, displacement, velocity, and graphs.",
};

/**
 * Kinematics has its own layout — full-screen dark immersive experience,
 * no sidebar or topbar.
 */
export default function KinematicsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="kinematics-immersive" style={{ marginLeft: 0 }}>
      {children}
    </div>
  );
}
