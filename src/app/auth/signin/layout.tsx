import { PublicRoute } from "@/components/auth/PublicRoute";

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return <PublicRoute>{children}</PublicRoute>;
}
