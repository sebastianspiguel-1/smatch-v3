import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts"
import { T } from "../theme"

export default function RadarChartComponent({ data, height = 200 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
        <PolarGrid
          stroke={T.border}
          strokeWidth={1.5}
          strokeDasharray="0"
        />
        <PolarAngleAxis
          dataKey="dimension"
          tick={{ fill: T.text, fontSize: 11, fontWeight: 600 }}
          tickLine={false}
        />
        <Radar
          dataKey="score"
          stroke={T.teal}
          fill={T.teal}
          fillOpacity={0.15}
          strokeWidth={3}
          dot={{
            r: 5,
            fill: T.teal,
            strokeWidth: 2,
            stroke: "#ffffff"
          }}
          animationDuration={800}
          animationEasing="ease-out"
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
