import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function read(path: string) {
  return readFileSync(join(root, path), "utf8");
}

describe("unbind partner flow", () => {
  it("ships a security definer rpc that clears both sides of the binding", () => {
    const sqlPath = join(root, "supabase/unbind_partner.sql");
    expect(existsSync(sqlPath)).toBe(true);

    const sql = read("supabase/unbind_partner.sql");
    expect(sql).toMatch(/create or replace function public\.unbind_partner\(\)/i);
    expect(sql).toMatch(/security definer/i);
    expect(sql).toMatch(/auth\.uid\(\)/i);
    expect(sql).toMatch(/select bound_user_id/i);
    expect(sql).toMatch(/where id = current_user_id/i);
    expect(sql).toMatch(/where id = partner_id\s+and bound_user_id = current_user_id/i);
    expect(sql).toMatch(/revoke all on function public\.unbind_partner\(\) from public/i);
    expect(sql).toMatch(/grant execute on function public\.unbind_partner\(\) to authenticated/i);
  });

  it("calls the unbind rpc from a server action and refreshes affected pages", () => {
    const actions = read("app/bind/actions.ts");

    expect(actions).toContain("unbindPartner");
    expect(actions).toContain('rpc("unbind_partner")');
    expect(actions).toContain('revalidatePath("/dashboard")');
    expect(actions).toContain('revalidatePath("/profile")');
    expect(actions).toContain('revalidatePath("/bind")');
    expect(actions).toContain('revalidatePath("/partner")');
    expect(actions).toContain("unbound=1");
  });

  it("shows confirmed unbind controls on the bind management page only", () => {
    expect(read("components/ConfirmSubmitButton.tsx")).toContain("window.confirm");
    expect(read("components/ConfirmSubmitButton.tsx")).toContain("确定要解除绑定吗？解除后双方将不能互相查看记录。");
    expect(read("app/bind/page.tsx")).toContain("解除绑定");
    expect(read("app/bind/page.tsx")).toContain("已解除绑定");
    expect(read("app/profile/page.tsx")).toContain("管理绑定");
    expect(read("app/profile/page.tsx")).not.toContain("解除绑定");
    expect(read("app/profile/page.tsx")).not.toContain("unbindPartner");
  });
});
