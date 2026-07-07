import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import type { Profile } from "@/types/database";

export default async function AdminUsersPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
  const users = (data || []) as Profile[];
  const userMap = new Map(users.map((user) => [user.id, user]));

  return (
    <div className="admin-stack">
      <section className="admin-heading">
        <p className="eyebrow">用户管理</p>
        <h1>所有用户</h1>
      </section>

      <section className="admin-panel table-panel">
        <div className="responsive-table">
          <table>
            <thead>
              <tr>
                <th>用户ID</th>
                <th>用户名</th>
                <th>邮箱</th>
                <th>角色</th>
                <th>绑定码</th>
                <th>绑定对象</th>
                <th>注册时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="mono">{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={user.role === "admin" ? "role-badge admin" : "role-badge"}>{user.role}</span>
                  </td>
                  <td className="mono">{user.bind_code}</td>
                  <td>{user.bound_user_id ? userMap.get(user.bound_user_id)?.username || user.bound_user_id : "未绑定"}</td>
                  <td>{new Date(user.created_at).toLocaleString("zh-CN")}</td>
                  <td>
                    <Link className="text-link" href={`/admin/users/${user.id}`}>
                      查看记录
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
