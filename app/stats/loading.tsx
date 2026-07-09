import { AppPageLoading } from "@/components/AppPageLoading";

export default function StatsLoading() {
  return (
    <AppPageLoading
      section="数据统计"
      title="正在生成训练统计"
      description="正在分析你的运动数据"
      variant="stats"
      showBottomNav
    />
  );
}
