import { AppPageLoading } from "@/components/AppPageLoading";

export default function CheckinLoading() {
  return (
    <AppPageLoading
      section="打卡"
      title="正在准备打卡表单"
      description="马上就可以记录本次训练"
      variant="checkin"
      showBottomNav
    />
  );
}
