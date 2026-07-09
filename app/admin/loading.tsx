import { AppPageLoading } from "@/components/AppPageLoading";

export default function AdminLoading() {
  return (
    <AppPageLoading
      section="管理员后台"
      title="正在加载管理数据"
      description="正在同步用户和记录信息"
      variant="admin"
    />
  );
}
