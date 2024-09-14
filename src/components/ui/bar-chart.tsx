import {
  Bar,
  BarChart as RechartsBarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface BarChartProps {
  data: { time: string; count: number }[];
}

export function BarChart({ data }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart
        data={data}
        margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
      >
        <text
          x="50%"
          y="10"
          textAnchor="middle"
          dominantBaseline="hanging"
          fill="#888888"
          fontSize="12"
        >
          Logs/Time
        </text>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#444" />
        <XAxis
          dataKey="time"
          stroke="#888888"
          axisLine={{ stroke: "#888888" }}
          tickLine={false}
          tick={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={10}
          tickLine={{ stroke: "#888888" }}
          axisLine={{ stroke: "#888888" }}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip
          contentStyle={{
            background: "#333",
            border: "none",
            borderRadius: "4px",
            fontSize: 10,
          }}
          labelStyle={{ color: "#fff" }}
          itemStyle={{ color: "#10B981" }}
          labelFormatter={(label) => `Time: ${label}`}
          formatter={(value: number) => [`Count: ${value}`, "Logs"]}
        />
        <Bar dataKey="count" fill="#10B981" radius={[2, 2, 0, 0]} barSize={8} />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
