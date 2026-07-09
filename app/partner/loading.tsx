import { AppPageLoading } from "@/components/AppPageLoading";

export default function PartnerLoading() {
  return (
    <AppPageLoading
      section="对方记录"
      title="正在同步监督对象记录"
      description="正在获取对方最近训练动态"
      variant="partner"
      showBottomNav
    />
  );
}
