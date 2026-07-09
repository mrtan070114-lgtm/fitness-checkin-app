import { AppPageLoading } from "@/components/AppPageLoading";

export default function RecordsLoading() {
  return (
    <AppPageLoading
      section="我的记录"
      title="正在加载运动记录"
      description="正在整理你的训练历史"
      variant="records"
      showBottomNav
    />
  );
}
