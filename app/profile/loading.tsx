import { AppPageLoading } from "@/components/AppPageLoading";

export default function ProfileLoading() {
  return (
    <AppPageLoading
      section="我的"
      title="正在加载个人信息"
      description="正在同步头像、昵称和设置"
      variant="profile"
      showBottomNav
    />
  );
}
