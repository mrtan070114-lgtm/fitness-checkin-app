import { AppPageLoading } from "@/components/AppPageLoading";

export default function DashboardLoading() {
  return (
    <AppPageLoading
      section="首页"
      title="正在更新今日状态"
      description="正在同步你的训练数据"
      variant="dashboard"
      showBottomNav
    />
  );
}
