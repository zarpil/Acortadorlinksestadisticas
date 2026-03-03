"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Label } from "recharts"

interface MetricsChartProps {
    data: { name: string; value: number }[]
}

// Grayscale palette using our theme variables
const COLORS = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
]

export function MetricsPieChart({ data }: MetricsChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                No data available
            </div>
        )
    }

    const total = data.reduce((sum, entry) => sum + entry.value, 0)

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    strokeWidth={0}
                >
                    {data.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    <Label
                        content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                return (
                                    <text
                                        x={viewBox.cx}
                                        y={viewBox.cy}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                    >
                                        <tspan
                                            x={viewBox.cx}
                                            y={(viewBox.cy || 0) - 16}
                                            className="fill-foreground text-3xl font-bold"
                                        >
                                            {total.toLocaleString()}
                                        </tspan>
                                        <tspan
                                            x={viewBox.cx}
                                            y={(viewBox.cy || 0) + 8}
                                            className="fill-muted-foreground text-xs uppercase tracking-wider"
                                        >
                                            Total
                                        </tspan>
                                    </text>
                                )
                            }
                        }}
                    />
                </Pie>
                <Tooltip
                    contentStyle={{
                        backgroundColor: "var(--background)",
                        borderColor: "var(--border)",
                        borderRadius: "8px",
                        color: "var(--foreground)"
                    }}
                    itemStyle={{ color: "var(--foreground)" }}
                    formatter={(value: number | string | undefined) => {
                        if (value === undefined) return ["0 (0%)"]
                        const val = typeof value === "string" ? parseFloat(value) : value
                        return [`${val} (${total > 0 ? ((val / total) * 100).toFixed(1) : 0}%)`]
                    }}
                />
                <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value: string) => <span className="text-foreground text-[10px] uppercase font-medium">{value}</span>}
                />
            </PieChart>
        </ResponsiveContainer>
    )
}
