import { View, Text } from "react-native";
import Svg, { Polyline, Circle, Rect, G, Path, Line } from "react-native-svg";
import { colors } from "@/lib/theme";

// --- Line chart: multiple series over time (e.g. wellbeing 1–10) ---
export function LineChart({
  series,
  width = 300,
  height = 180,
  maxY = 10,
}: {
  series: { color: string; values: number[] }[];
  width?: number;
  height?: number;
  maxY?: number;
}) {
  const pad = 8;
  const w = width - pad * 2;
  const h = height - pad * 2;
  const longest = Math.max(1, ...series.map((s) => s.values.length));
  const stepX = longest > 1 ? w / (longest - 1) : w;

  return (
    <Svg width={width} height={height}>
      {/* gridlines */}
      {[0, 0.5, 1].map((g, i) => (
        <Line
          key={i}
          x1={pad}
          y1={pad + h * g}
          x2={pad + w}
          y2={pad + h * g}
          stroke={colors.slate[100]}
          strokeWidth={1}
        />
      ))}
      {series.map((s, si) => {
        if (s.values.length === 0) return null;
        const pts = s.values
          .map((v, i) => `${pad + i * stepX},${pad + h - (Math.min(v, maxY) / maxY) * h}`)
          .join(" ");
        return (
          <G key={si}>
            <Polyline points={pts} fill="none" stroke={s.color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
            {s.values.map((v, i) => (
              <Circle
                key={i}
                cx={pad + i * stepX}
                cy={pad + h - (Math.min(v, maxY) / maxY) * h}
                r={2.5}
                fill={s.color}
              />
            ))}
          </G>
        );
      })}
    </Svg>
  );
}

// --- Horizontal bar chart for labelled counts ---
export function BarList({
  data,
  color = colors.emerald[400],
}: {
  data: { label: string; value: number }[];
  color?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <View className="gap-2">
      {data.map((d) => (
        <View key={d.label} className="flex-row items-center gap-2">
          <Text className="text-xs text-slate-500 w-24" numberOfLines={1}>
            {d.label}
          </Text>
          <View className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden">
            <View
              className="h-full rounded-full"
              style={{ width: `${(d.value / max) * 100}%`, backgroundColor: color }}
            />
          </View>
          <Text className="text-xs font-semibold text-slate-600 w-5 text-right">{d.value}</Text>
        </View>
      ))}
    </View>
  );
}

// --- Donut chart for category proportions ---
export function DonutChart({
  data,
  size = 160,
  thickness = 26,
}: {
  data: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  if (total === 0) return null;

  return (
    <View className="flex-row items-center gap-4">
      <Svg width={size} height={size}>
        <G rotation={-90} origin={`${cx}, ${cy}`}>
          {data.map((d, i) => {
            const frac = d.value / total;
            const dash = frac * circumference;
            const seg = (
              <Circle
                key={i}
                cx={cx}
                cy={cy}
                r={r}
                stroke={d.color}
                strokeWidth={thickness}
                fill="none"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
              />
            );
            offset += dash;
            return seg;
          })}
        </G>
      </Svg>
      <View className="flex-1 gap-1.5">
        {data.map((d) => (
          <View key={d.label} className="flex-row items-center gap-2">
            <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
            <Text className="text-xs text-slate-600 flex-1" numberOfLines={1}>
              {d.label}
            </Text>
            <Text className="text-xs font-semibold text-slate-500">{d.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
