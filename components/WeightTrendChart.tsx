type WeightPoint = {
  date: string;
  weight: number;
};

type WeightTrendChartProps = {
  points: WeightPoint[];
};

function buildPolyline(points: WeightPoint[], width: number, height: number, padding: number) {
  if (points.length < 2) return "";

  const weights = points.map((point) => point.weight);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const range = max - min || 1;

  return points
    .map((point, index) => {
      const x = padding + (index / (points.length - 1)) * (width - padding * 2);
      const y = padding + ((max - point.weight) / range) * (height - padding * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function WeightTrendChart({ points }: WeightTrendChartProps) {
  const width = 640;
  const height = 240;
  const padding = 28;
  const polyline = buildPolyline(points, width, height, padding);

  if (points.length < 2) {
    return (
      <div className="empty-chart">
        <p>记录更多体重后即可生成趋势图</p>
      </div>
    );
  }

  return (
    <div className="chart-shell">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="体重变化曲线">
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} className="chart-axis" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} className="chart-axis" />
        <polyline points={polyline} className="chart-line" />
        {points.map((point, index) => {
          const [x, y] = polyline.split(" ")[index].split(",").map(Number);
          return <circle cx={x} cy={y} r="4" className="chart-dot" key={`${point.date}-${point.weight}`} />;
        })}
      </svg>
    </div>
  );
}
