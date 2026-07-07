import { BottomNav } from "@/components/BottomNav";

type PageLoadingProps = {
  title?: string;
  subtitle?: string;
};

export function PageLoading({ title = "正在加载", subtitle = "请稍候" }: PageLoadingProps) {
  return (
    <div className="page-shell with-bottom-nav">
      <main className="content-stack" aria-busy="true" aria-live="polite">
        <section className="loading-card">
          <div>
            <p className="eyebrow">{title}</p>
            <h2>{subtitle}</h2>
          </div>
          <div className="loading-spinner" aria-hidden="true" />
        </section>
        <section className="loading-grid" aria-hidden="true">
          <span />
          <span />
          <span />
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
