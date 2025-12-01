"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StatsCard, StatsCardGrid } from "@/components/ui/stats-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAsync } from "@/hooks/use-async";
import { logger } from "@/lib/logging";
import { DollarSign, Download, ShoppingCart, Star, Users } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Loading skeleton for charts
const ChartSkeleton = ({ height }: { height: string }) => (
  <Skeleton className={`h-[${height}] w-full`} />
);

// Dynamically import chart components to reduce bundle size (SSR disabled)
// Note: Recharts components use complex generic types that are incompatible with Next.js dynamic() type inference.
// This is a known limitation documented at https://github.com/vercel/next.js/discussions/30568
// Using type-safe lazy import wrapper to centralize the necessary type bypass.
import type { ComponentType } from "react";
import type {
  AreaChart as AreaChartType,
  Area as AreaType,
  BarChart as BarChartType,
  Bar as BarType,
  CartesianGrid as CartesianGridType,
  Cell as CellType,
  Legend as LegendType,
  LineChart as LineChartType,
  Line as LineType,
  PieChart as PieChartType,
  Pie as PieType,
  ResponsiveContainer as ResponsiveContainerType,
  Tooltip as TooltipType,
  XAxis as XAxisType,
  YAxis as YAxisType,
} from "recharts";

// Recharts dynamic import helper - centralizes the type assertion needed for Next.js dynamic()

const lazyRecharts = <T,>(
  loader: () => Promise<{ default: T }>,
  skeleton?: React.ReactNode
): ComponentType<any> =>
  dynamic(loader as () => Promise<{ default: React.ComponentType }>, {
    loading: skeleton ? () => skeleton : undefined,
    ssr: false,
  });

const AreaChart = lazyRecharts<typeof AreaChartType>(
  () => import("recharts").then((m) => ({ default: m.AreaChart })),
  <ChartSkeleton height="300px" />
);
const Area = lazyRecharts<typeof AreaType>(() =>
  import("recharts").then((m) => ({ default: m.Area }))
);
const BarChart = lazyRecharts<typeof BarChartType>(
  () => import("recharts").then((m) => ({ default: m.BarChart })),
  <ChartSkeleton height="400px" />
);
const Bar = lazyRecharts<typeof BarType>(() =>
  import("recharts").then((m) => ({ default: m.Bar }))
);
const LineChart = lazyRecharts<typeof LineChartType>(
  () => import("recharts").then((m) => ({ default: m.LineChart })),
  <ChartSkeleton height="400px" />
);
const Line = lazyRecharts<typeof LineType>(() =>
  import("recharts").then((m) => ({ default: m.Line }))
);
const PieChart = lazyRecharts<typeof PieChartType>(
  () => import("recharts").then((m) => ({ default: m.PieChart })),
  <ChartSkeleton height="400px" />
);
const Pie = lazyRecharts<typeof PieType>(() =>
  import("recharts").then((m) => ({ default: m.Pie }))
);
const Cell = lazyRecharts<typeof CellType>(() =>
  import("recharts").then((m) => ({ default: m.Cell }))
);
const XAxis = lazyRecharts<typeof XAxisType>(() =>
  import("recharts").then((m) => ({ default: m.XAxis }))
);
const YAxis = lazyRecharts<typeof YAxisType>(() =>
  import("recharts").then((m) => ({ default: m.YAxis }))
);
const CartesianGrid = lazyRecharts<typeof CartesianGridType>(() =>
  import("recharts").then((m) => ({ default: m.CartesianGrid }))
);
const Tooltip = lazyRecharts<typeof TooltipType>(() =>
  import("recharts").then((m) => ({ default: m.Tooltip }))
);
const Legend = lazyRecharts<typeof LegendType>(() =>
  import("recharts").then((m) => ({ default: m.Legend }))
);
const ResponsiveContainer = lazyRecharts<typeof ResponsiveContainerType>(() =>
  import("recharts").then((m) => ({ default: m.ResponsiveContainer }))
);

interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalRevenue: number;
    totalCourses: number;
    totalEvents: number;
    userGrowth: number;
    revenueGrowth: number;
    activeSubscriptions: number;
    averageRating: number;
  };
  revenueChart: Array<{
    date: string;
    revenue: number;
    subscriptions: number;
    oneTime: number;
  }>;
  userChart: Array<{ date: string; signups: number; active: number }>;
  courseStats: Array<{
    title: string;
    enrollments: number;
    revenue: number;
    completion: number;
    rating: number;
  }>;
  eventStats: Array<{
    title: string;
    registrations: number;
    revenue: number;
    attendance: number;
  }>;
  userDemographics: Array<{ category: string; value: number }>;
  topInstructors: Array<{
    name: string;
    students: number;
    revenue: number;
    rating: number;
  }>;
  topPages: Array<{ path: string; views: number }>;
  revenueByCategory: Array<{ name: string; value: number }>;
}

const defaultData: AnalyticsData = {
  overview: {
    totalUsers: 0,
    totalRevenue: 0,
    totalCourses: 0,
    totalEvents: 0,
    userGrowth: 0,
    revenueGrowth: 0,
    activeSubscriptions: 0,
    averageRating: 0,
  },
  revenueChart: [],
  userChart: [],
  courseStats: [],
  eventStats: [],
  userDemographics: [],
  topInstructors: [],
  topPages: [],
  revenueByCategory: [],
};

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30");
  const [exportLoading, setExportLoading] = useState(false);

  const { data: analyticsData, loading, execute } = useAsync<AnalyticsData>();

  const data = analyticsData || defaultData;

  useEffect(() => {
    fetchAnalytics(timeRange);
  }, [timeRange]);

  const fetchAnalytics = (days: string) => {
    execute(async () => {
      const res = await fetch(`/api/dashboard/admin/analytics?days=${days}`);
      if (!res.ok) {
        logger.error(
          "Analytics API error:",
          new Error(`Status: ${res.status}`)
        );
        return defaultData;
      }
      const result = await res.json();
      if (result.error) {
        logger.error("Error fetching analytics:", new Error(result.error));
        return defaultData;
      }
      return result;
    });
  };

  const exportData = async (type: string = "overview") => {
    setExportLoading(true);
    try {
      const response = await fetch(
        `/api/dashboard/admin/analytics/export?days=${timeRange}&type=${type}`
      );

      if (!response.ok) {
        throw new Error("Export failed");
      }

      // Get the filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get("Content-Disposition");
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch
        ? filenameMatch[1]
        : `analytics-export-${type}.csv`;

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      logger.info("Exported analytics data", { type, timeRange });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error exporting data:", err as Error);
    } finally {
      setExportLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Platform insights and performance metrics
          </p>
        </div>
        <div className="flex gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
              <SelectItem value="365">1 year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => exportData("overview")}
            disabled={exportLoading}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <StatsCardGrid columns={4} className="mb-8">
        <StatsCard
          title="Total Users"
          value={data.overview.totalUsers.toLocaleString()}
          description="from last month"
          icon={<Users className="h-5 w-5" />}
          accent="blue"
          trend={{
            direction: data.overview.userGrowth >= 0 ? "up" : "down",
            value: `${Math.abs(data.overview.userGrowth)}%`,
          }}
        />
        <StatsCard
          title="Active Subscriptions"
          value={data.overview.activeSubscriptions.toLocaleString()}
          description="Recurring revenue base"
          icon={<ShoppingCart className="h-5 w-5" />}
          accent="purple"
        />
        <StatsCard
          title="Revenue (MTD)"
          value={`$${(data.overview.totalRevenue / 100).toLocaleString()}`}
          description="from last month"
          icon={<DollarSign className="h-5 w-5" />}
          accent="green"
          trend={{
            direction: data.overview.revenueGrowth >= 0 ? "up" : "down",
            value: `${Math.abs(data.overview.revenueGrowth)}%`,
          }}
        />
        <StatsCard
          title="Average Rating"
          value={data.overview.averageRating.toFixed(1)}
          description="Platform satisfaction score"
          icon={<Star className="h-5 w-5" />}
          accent="amber"
        />
      </StatsCardGrid>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Daily revenue breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.revenueChart.slice(-7)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) =>
                        `$${(value / 100).toFixed(2)}`
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8884d8"
                      fill="#8884d8"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
                <CardDescription>New signups and active users</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.userChart.slice(-7)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="signups"
                      stroke="#8884d8"
                      name="Signups"
                    />
                    <Line
                      type="monotone"
                      dataKey="active"
                      stroke="#82ca9d"
                      name="Active"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Courses</CardTitle>
                <CardDescription>
                  Most popular courses by enrollment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.courseStats.slice(0, 3).map((course, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm">{course.title}</span>
                      <Badge>
                        {course.enrollments.toLocaleString()} students
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Popular Pages</CardTitle>
                <CardDescription>Most visited pages this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.topPages.slice(0, 3).map((page, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm">{page.path}</span>
                      <Badge variant="outline">
                        {page.views.toLocaleString()} views
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>Daily revenue breakdown by type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={data.revenueChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) =>
                      `$${(value / 100).toFixed(2)}`
                    }
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="subscriptions"
                    stackId="1"
                    stroke="#8884d8"
                    fill="#8884d8"
                    name="Subscriptions"
                  />
                  <Area
                    type="monotone"
                    dataKey="oneTime"
                    stackId="1"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    name="One-time"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Instructors by Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.topInstructors.map((instructor, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{instructor.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {instructor.students} students
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          ${instructor.revenue.toLocaleString()}
                        </p>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                          <span className="text-sm">
                            {instructor.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue by Category</CardTitle>
              </CardHeader>
              <CardContent>
                {data.revenueByCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={data.revenueByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ percent }: { percent: number }) =>
                          `${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {data.revenueByCategory.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No revenue data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>
                New signups and active users over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data.userChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="signups"
                    stroke="#8884d8"
                    name="New Signups"
                  />
                  <Line
                    type="monotone"
                    dataKey="active"
                    stroke="#82ca9d"
                    name="Active Users"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Performance</CardTitle>
              <CardDescription>
                Top courses by enrollment and revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Course</th>
                      <th className="text-right py-2">Enrollments</th>
                      <th className="text-right py-2">Revenue</th>
                      <th className="text-right py-2">Completion</th>
                      <th className="text-right py-2">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.courseStats.map((course, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2">{course.title}</td>
                        <td className="text-right">{course.enrollments}</td>
                        <td className="text-right">
                          ${(course.revenue / 100).toFixed(2)}
                        </td>
                        <td className="text-right">{course.completion}%</td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                            {course.rating.toFixed(1)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Performance</CardTitle>
              <CardDescription>
                Upcoming and past events statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.eventStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="title"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="registrations"
                    fill="#8884d8"
                    name="Registrations"
                  />
                  <Bar
                    dataKey="attendance"
                    fill="#82ca9d"
                    name="Attendance %"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demographics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Demographics</CardTitle>
              <CardDescription>Distribution of user types</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={data.userDemographics}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({
                      name,
                      percent,
                    }: {
                      name: string;
                      percent: number;
                    }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.userDemographics.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
