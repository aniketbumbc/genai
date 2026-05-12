import { Bar, BarChart, XAxis } from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from './ui/chart';


const chartConfig = {
  amount: {
    label: 'Amount',
    color: 'white',
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
      className="min-h-[280px] w-full max-w-md py-12 bg-zinc-900 rounded-xl my-4 p-4">
      <BarChart accessibilityLayer data={chartData}>
        <ChartTooltip
          content={<ChartTooltipContent />}
          cursor={false}
                className="bg-white text-zinc-900 border border-zinc-200 shadow-sm"

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
          fill="yellow"
          radius={1}
          barSize={24}
        />
      </BarChart>
    </ChartContainer>
  );
}