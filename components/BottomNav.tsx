"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

  return (
    <nav className="bottom-nav" aria-label="用户底部导航">
      {items.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;

        return (
          <Link className={active ? "bottom-nav-item active" : "bottom-nav-item"} href={item.href} key={item.href}>
            <Icon size={20} aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
