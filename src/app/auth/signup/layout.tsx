import { PublicRoute } from "@/components/auth/PublicRoute";

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return <PublicRoute>{children}</PublicRoute>;
}
