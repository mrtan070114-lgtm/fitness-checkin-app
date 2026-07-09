import { AppPageLoading } from "@/components/AppPageLoading";

export default function GoalsLoading() {
  return (
    <AppPageLoading
      section="健身目标"
      title="正在加载目标信息"
      description="正在计算你的目标进度"
      variant="default"
      showBottomNav
    />
  );
}
