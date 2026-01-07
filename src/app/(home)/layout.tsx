import { SpeedInsights } from "@vercel/speed-insights/next"
import { getSession } from "@/lib/auth/session";
import HomeLayoutClient from "./HomeLayoutClient";

export default async function HomeLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <HomeLayoutClient user={session.user}>
      {children}
      <SpeedInsights />
    </HomeLayoutClient>
  );
}
