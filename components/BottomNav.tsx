"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CalendarCheck, Dumbbell, Home, UserRound, UsersRound } from "lucide-react";

const items = [
  { href: "/dashboard", label: "首页", icon: Home },
  { href: "/checkin", label: "打卡", icon: Dumbbell },
  { href: "/records", label: "记录", icon: CalendarCheck },
  { href: "/partner", label: "对方", icon: UsersRound },
  { href: "/profile", label: "我的", icon: UserRound }
];

export function BottomNav() {
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  return (
    <nav className="bottom-nav" aria-label="用户底部导航">
      {items.map((item) => {
        const Icon = item.icon;
        const pending = pendingHref === item.href && pathname !== item.href;
        const active = pathname === item.href || pending;
        const className = active ? `bottom-nav-item active${pending ? " pending" : ""}` : "bottom-nav-item";

        return (
          <Link
            className={className}
            href={item.href}
            key={item.href}
            prefetch={true}
            onNavigate={() => {
              setPendingHref(item.href);
            }}
          >
            <Icon size={20} aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
