import { Bar, BarChart, XAxis } from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from './ui/chart';
import type { ChartConfig } from './ui/chart';

// const chartData = [
//   { month: 'January', desktop: 186, mobile: 80 },
//   { month: 'February', desktop: 305, mobile: 200 },
//   { month: 'March', desktop: 237, mobile: 120 },
//   { month: 'April', desktop: 73, mobile: 190 },
//   { month: 'May', desktop: 209, mobile: 130 },
//   { month: 'June', desktop: 214, mobile: 140 },
// ];

// [
//     {
//       "date": "2025-11-25",
//       "amount": 45000
//     },
//     {
//       "date": "2025-11-26",
//       "amount": 2000
//     }
//   ],

const chartConfig = {
  amount: {
    label: 'Amount',
    color: '#fff',
  },
} satisfies ChartConfig;

type ChartElement = {
  [key: string]: string | number;
};

export function ExpenseChart({
  chartData,
  labelKey,
}: {
  chartData: ChartElement[];
  labelKey: string;
}) {
  return (
    <ChartContainer
      config={chartConfig}
      className="min-h-[200px] py-12 bg-zinc-900 rounded-xl my-4 p-4">
      <BarChart accessibilityLayer data={chartData}>
        <ChartTooltip
          content={<ChartTooltipContent />}
          cursor={false}
        />
        <XAxis
          dataKey={labelKey}
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 30)}
        />

        <Bar
          dataKey="amount"
          fill="var(--color-amount)"
          radius={4}
        />
      </BarChart>
    </ChartContainer>
  );
}