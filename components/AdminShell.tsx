import Link from "next/link";
import { BarChart3, CalendarCheck, Dumbbell, UsersRound } from "lucide-react";
import type { Profile } from "@/types/database";
import { SignOutButton } from "@/components/SignOutButton";

type AdminShellProps = {
  profile: Profile;
  children: React.ReactNode;
};

const adminNav = [
  { href: "/admin/dashboard", label: "后台首页", icon: BarChart3 },
  { href: "/admin/users", label: "用户管理", icon: UsersRound },
  { href: "/admin/checkins", label: "记录管理", icon: CalendarCheck }
];

export function AdminShell({ profile, children }: AdminShellProps) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div>
          <div className="brand-mark">
            <Dumbbell size={22} aria-hidden="true" />
            <span>Fitness Admin</span>
          </div>
          <p className="admin-user">{profile.username}</p>
        </div>
        <nav>
          {adminNav.map((item) => {
            const Icon = item.icon;
            return (
              <Link href={item.href} key={item.href}>
                <Icon size={18} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <SignOutButton />
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
