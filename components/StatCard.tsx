type StatCardProps = {
  label: string;
  value: React.ReactNode;
  tone?: "green" | "orange" | "blue" | "neutral";
};

export function StatCard({ label, value, tone = "neutral" }: StatCardProps) {
  return (
    <article className={`stat-card ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
