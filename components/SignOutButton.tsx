import { LogOut } from "lucide-react";
import { signOut } from "@/app/logout/actions";

type SignOutButtonProps = {
  className?: string;
  label?: string;
};

export function SignOutButton({ className = "ghost-button compact", label = "退出" }: SignOutButtonProps) {
  return (
    <form action={signOut}>
      <button className={className} type="submit">
        <LogOut size={16} aria-hidden="true" />
        {label}
      </button>
    </form>
  );
}
