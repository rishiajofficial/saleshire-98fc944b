
import * as React from "react";
import {
  Bar as RechartsBar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line as RechartsLine,
  LineChart as RechartsLineChart,
  Pie as RechartsPie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
} from "recharts";

import { cn } from "@/lib/utils";

interface ChartContainerProps {
  children: React.ReactNode;
  className?: string;
  columns?: number;
}

const ChartContainer = React.forwardRef<
  React.ElementRef<typeof ResponsiveContainer>,
  ChartContainerProps
>(({ className, children, ...props }, ref) => (
  <div className={cn("w-full h-full", className)}>
    <ResponsiveContainer width="100%" height="100%">
      {children}
    </ResponsiveContainer>
  </div>
));
ChartContainer.displayName = "ChartContainer";

const BarChart = React.forwardRef<
  React.ElementRef<typeof RechartsBarChart>,
  React.ComponentProps<typeof RechartsBarChart> & {
    showTooltip?: boolean;
    showXAxis?: boolean;
    showYAxis?: boolean;
    showLegend?: boolean;
    showGrid?: boolean;
    layout?: "horizontal" | "vertical";
  }
>(
  (
    {
      className,
      showTooltip = true,
      showXAxis = true,
      showYAxis = true,
      showLegend = false,
      showGrid = false,
      layout = "horizontal",
      data,
      ...props
    },
    ref
  ) => (
    <RechartsBarChart
      ref={ref}
      data={data}
      layout={layout}
      className={cn("w-full h-full", className)}
      {...props}
    >
      {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} />}
      {showXAxis && (
        <RechartsXAxis
          dataKey={layout === "horizontal" ? "name" : undefined}
          type={layout === "horizontal" ? "category" : "number"}
          tick={{ transform: "translate(0, 8)" }}
          tickLine={{ transform: "translate(0, 8)" }}
          style={{ fontSize: 12 }}
          interval={0}
        />
      )}
      {showYAxis && (
        <RechartsYAxis
          dataKey={layout === "vertical" ? "name" : undefined}
          type={layout === "vertical" ? "category" : "number"}
          width={layout === "vertical" ? 120 : 35}
          tick={{ transform: "translate(-3, 0)" }}
          tickLine={{ transform: "translate(-3, 0)" }}
          style={{ fontSize: 12 }}
          interval={0}
        />
      )}
      {showTooltip && <Tooltip cursor={false} content={<CustomTooltip />} />}
      {showLegend && <Legend />}
      {props.children}
    </RechartsBarChart>
  )
);
BarChart.displayName = "BarChart";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: string | number;
    payload: Record<string, any>;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <div className="font-medium">{label}</div>
          {payload.map((item, i) => (
            <div key={i} className="flex items-center gap-1 text-sm text-muted-foreground">
              <div className="font-medium">{item.name}:</div>
              <div>{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return null;
};

// Fix Bar component - remove forwardRef to avoid type issues
const Bar = (props: React.ComponentProps<typeof RechartsBar>) => (
  <RechartsBar {...props} />
);
Bar.displayName = "Bar";

const XAxis = React.forwardRef<
  React.ElementRef<typeof RechartsXAxis>,
  React.ComponentProps<typeof RechartsXAxis>
>(({ className, ...props }, ref) => (
  <RechartsXAxis
    axisLine={false}
    tickLine={false}
    tick={{ fontSize: 12 }}
    {...props}
  />
));
XAxis.displayName = "XAxis";

const YAxis = React.forwardRef<
  React.ElementRef<typeof RechartsYAxis>,
  React.ComponentProps<typeof RechartsYAxis>
>(({ className, ...props }, ref) => (
  <RechartsYAxis
    axisLine={false}
    tickLine={false}
    tick={{ fontSize: 12 }}
    width={80}
    {...props}
  />
));
YAxis.displayName = "YAxis";

// Fix Line component - remove forwardRef to avoid type issues
const Line = (props: React.ComponentProps<typeof RechartsLine>) => (
  <RechartsLine activeDot={{ r: 8 }} {...props} />
);
Line.displayName = "Line";

const PieChart = React.forwardRef<
  React.ElementRef<typeof RechartsPieChart>,
  React.ComponentProps<typeof RechartsPieChart>
>(({ className, children, ...props }, ref) => (
  <RechartsPieChart ref={ref} className={cn("w-full h-full", className)} {...props}>
    {children}
  </RechartsPieChart>
));
PieChart.displayName = "PieChart";

// Fix Pie component - remove forwardRef to avoid type issues
const Pie = (props: React.ComponentProps<typeof RechartsPie>) => (
  <RechartsPie {...props} />
);
Pie.displayName = "Pie";

export {
  Bar,
  BarChart,
  Cell,
  ChartContainer,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
};
