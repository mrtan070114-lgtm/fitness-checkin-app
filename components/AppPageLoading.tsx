import { BottomNav } from "@/components/BottomNav";
import { ThemeMetaUpdater } from "@/components/ThemeMetaUpdater";

type LoadingVariant = "dashboard" | "checkin" | "records" | "partner" | "profile" | "stats" | "admin" | "default";

type AppPageLoadingProps = {
  section: string;
  title: string;
  description?: string;
  variant?: "dashboard" | "checkin" | "records" | "partner" | "profile" | "stats" | "admin" | "default";
  showBottomNav?: boolean;
};

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <span className={className ? `app-loading-block ${className}` : "app-loading-block"} />;
}

function SkeletonCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={className ? `app-loading-card ${className}` : "app-loading-card"}>{children}</div>;
}

function MetricSkeletonGrid({ count = 2 }: { count?: number }) {
  return (
    <div className="app-loading-metric-grid">
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard className="compact" key={index}>
          <SkeletonBlock className="line short" />
          <SkeletonBlock className="line medium" />
        </SkeletonCard>
      ))}
    </div>
  );
}

function RecordListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="app-loading-list">
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard className="record" key={index}>
          <div className="app-loading-row">
            <SkeletonBlock className="avatar" />
            <div className="app-loading-column">
              <SkeletonBlock className="line medium" />
              <SkeletonBlock className="line short" />
            </div>
          </div>
          <SkeletonBlock className="line wide" />
        </SkeletonCard>
      ))}
    </div>
  );
}

function renderSkeleton(variant: LoadingVariant) {
  switch (variant) {
    case "dashboard":
      return (
        <>
          <SkeletonCard className="feature">
            <SkeletonBlock className="line short" />
            <SkeletonBlock className="line wide" />
            <SkeletonBlock className="line medium" />
          </SkeletonCard>
          <SkeletonCard>
            <SkeletonBlock className="line medium" />
            <SkeletonBlock className="pill wide" />
            <SkeletonBlock className="line short" />
          </SkeletonCard>
          <MetricSkeletonGrid />
        </>
      );
    case "checkin":
      return (
        <>
          <SkeletonCard className="form">
            <SkeletonBlock className="line medium" />
            <div className="app-loading-chip-row">
              <SkeletonBlock className="chip" />
              <SkeletonBlock className="chip" />
              <SkeletonBlock className="chip" />
            </div>
            <SkeletonBlock className="input" />
            <SkeletonBlock className="input" />
            <SkeletonBlock className="button" />
          </SkeletonCard>
        </>
      );
    case "records":
      return (
        <>
          <SkeletonCard className="filter">
            <SkeletonBlock className="pill medium" />
            <SkeletonBlock className="pill short" />
          </SkeletonCard>
          <RecordListSkeleton />
        </>
      );
    case "partner":
      return (
        <>
          <SkeletonCard className="profile">
            <div className="app-loading-row">
              <SkeletonBlock className="avatar large" />
              <div className="app-loading-column">
                <SkeletonBlock className="line medium" />
                <SkeletonBlock className="line short" />
              </div>
            </div>
          </SkeletonCard>
          <MetricSkeletonGrid />
          <RecordListSkeleton count={2} />
        </>
      );
    case "profile":
      return (
        <>
          <SkeletonCard className="profile">
            <div className="app-loading-row">
              <SkeletonBlock className="avatar large" />
              <div className="app-loading-column">
                <SkeletonBlock className="line medium" />
                <SkeletonBlock className="line short" />
              </div>
            </div>
          </SkeletonCard>
          <div className="app-loading-list">
            {Array.from({ length: 4 }, (_, index) => (
              <SkeletonCard className="settings" key={index}>
                <SkeletonBlock className="icon" />
                <SkeletonBlock className="line wide" />
              </SkeletonCard>
            ))}
          </div>
        </>
      );
    case "stats":
      return (
        <>
          <MetricSkeletonGrid count={3} />
          <SkeletonCard className="chart">
            <SkeletonBlock className="line medium" />
            <SkeletonBlock className="chart-area" />
          </SkeletonCard>
          <RecordListSkeleton count={2} />
        </>
      );
    case "admin":
      return (
        <>
          <MetricSkeletonGrid count={3} />
          <SkeletonCard className="table">
            <SkeletonBlock className="line medium" />
            {Array.from({ length: 4 }, (_, index) => (
              <SkeletonBlock className="table-row" key={index} />
            ))}
          </SkeletonCard>
        </>
      );
    default:
      return (
        <>
          <SkeletonCard className="feature">
            <SkeletonBlock className="line medium" />
            <SkeletonBlock className="line wide" />
          </SkeletonCard>
          <MetricSkeletonGrid />
          <RecordListSkeleton count={2} />
        </>
      );
  }
}

export function AppPageLoading({
  section,
  title,
  description = "请稍等一下",
  variant = "default",
  showBottomNav = false
}: AppPageLoadingProps) {
  const shellClassName = showBottomNav ? "user-shell app-page-loading has-bottom-nav" : "user-shell app-page-loading";
  const pageClassName = showBottomNav ? "page-shell with-bottom-nav app-loading-shell" : "page-shell app-loading-shell";

  return (
    <div className={`${shellClassName} app-page-loading-${variant}`}>
      <ThemeMetaUpdater />
      <div className={pageClassName}>
        <main className="content-stack app-loading-content" aria-busy="true" aria-live="polite">
          <section className="app-loading-hero">
            <div>
              <p className="eyebrow app-loading-section">{section}</p>
              <h1>{title}</h1>
              {description ? <p>{description}</p> : null}
            </div>
            <div className="app-loading-spinner" aria-hidden="true" />
          </section>
          <section className="app-loading-skeleton" aria-hidden="true">
            {renderSkeleton(variant)}
          </section>
        </main>
      </div>
      {showBottomNav ? <BottomNav /> : null}
    </div>
  );
}
