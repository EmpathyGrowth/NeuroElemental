"use client";

import { DashboardHeader } from "@/components/dashboard";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  CreditCard,
  DollarSign,
  Download,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface EarningsSummary {
  total_earnings: number;
  this_month: number;
  last_month: number;
  pending_payout: number;
  total_students: number;
  total_courses: number;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  course_title: string;
  amount: number;
  type: "sale" | "payout" | "refund";
  status: "completed" | "pending" | "failed";
}

interface CourseEarning {
  course_id: string;
  title: string;
  total_revenue: number;
  enrollments: number;
  average_rating: number;
}

export default function InstructorEarningsPage() {
  const [summary, setSummary] = useState<EarningsSummary>({
    total_earnings: 4250.0,
    this_month: 850.0,
    last_month: 720.0,
    pending_payout: 350.0,
    total_students: 127,
    total_courses: 3,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [courseEarnings, setCourseEarnings] = useState<CourseEarning[]>([]);
  const [_loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("all");

  useEffect(() => {
    fetchEarningsData();
  }, [period]);

  const fetchEarningsData = async () => {
    try {
      const res = await fetch(`/api/instructor/earnings?period=${period}`);
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary);
        setTransactions(data.transactions);
        setCourseEarnings(data.courseEarnings);
      } else {
        // Use mock data
        setTransactions([
          {
            id: "1",
            date: new Date().toISOString(),
            description: "Course enrollment",
            course_title: "Energy Mastery Fundamentals",
            amount: 97.0,
            type: "sale",
            status: "completed",
          },
          {
            id: "2",
            date: new Date(Date.now() - 86400000).toISOString(),
            description: "Course enrollment",
            course_title: "Advanced Energy Techniques",
            amount: 147.0,
            type: "sale",
            status: "completed",
          },
          {
            id: "3",
            date: new Date(Date.now() - 172800000).toISOString(),
            description: "Monthly payout",
            course_title: "-",
            amount: 450.0,
            type: "payout",
            status: "completed",
          },
          {
            id: "4",
            date: new Date(Date.now() - 259200000).toISOString(),
            description: "Course enrollment",
            course_title: "Energy Mastery Fundamentals",
            amount: 97.0,
            type: "sale",
            status: "completed",
          },
          {
            id: "5",
            date: new Date(Date.now() - 345600000).toISOString(),
            description: "Refund processed",
            course_title: "Energy Mastery Fundamentals",
            amount: -97.0,
            type: "refund",
            status: "completed",
          },
        ]);
        setCourseEarnings([
          {
            course_id: "1",
            title: "Energy Mastery Fundamentals",
            total_revenue: 2425.0,
            enrollments: 25,
            average_rating: 4.8,
          },
          {
            course_id: "2",
            title: "Advanced Energy Techniques",
            total_revenue: 1470.0,
            enrollments: 10,
            average_rating: 4.9,
          },
          {
            course_id: "3",
            title: "Element Relationships Workshop",
            total_revenue: 355.0,
            enrollments: 5,
            average_rating: 4.7,
          },
        ]);
      }
    } catch {
      // Keep mock data
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const monthlyChange =
    summary.last_month > 0
      ? (
          ((summary.this_month - summary.last_month) / summary.last_month) *
          100
        ).toFixed(1)
      : "0";
  const isPositiveChange = parseFloat(monthlyChange) >= 0;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <DashboardHeader
        title="Earnings"
        subtitle="Track your course revenue and payouts"
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/instructor">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Link>
            </Button>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Earnings</CardDescription>
            <CardTitle className="text-3xl">
              {formatCurrency(summary.total_earnings)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <DollarSign className="w-4 h-4 mr-1" />
              Lifetime revenue
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>This Month</CardDescription>
            <CardTitle className="text-3xl">
              {formatCurrency(summary.this_month)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`flex items-center text-sm ${isPositiveChange ? "text-green-600" : "text-red-600"}`}
            >
              {isPositiveChange ? (
                <ArrowUpRight className="w-4 h-4 mr-1" />
              ) : (
                <ArrowDownRight className="w-4 h-4 mr-1" />
              )}
              {monthlyChange}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Payout</CardDescription>
            <CardTitle className="text-3xl">
              {formatCurrency(summary.pending_payout)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <CreditCard className="w-4 h-4 mr-1" />
              Next payout: 1st of month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Students</CardDescription>
            <CardTitle className="text-3xl">{summary.total_students}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="w-4 h-4 mr-1" />
              Across {summary.total_courses} courses
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue by Course */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Revenue by Course</CardTitle>
                <CardDescription>
                  Breakdown of earnings per course
                </CardDescription>
              </div>
              <BookOpen className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {courseEarnings.map((course) => (
                <div
                  key={course.course_id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{course.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {course.enrollments} students • {course.average_rating}★
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(course.total_revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest earnings activity</CardDescription>
              </div>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.slice(0, 5).map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(tx.date)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{tx.description}</span>
                        {tx.type === "payout" && (
                          <Badge variant="outline" className="text-xs">
                            Payout
                          </Badge>
                        )}
                        {tx.type === "refund" && (
                          <Badge variant="destructive" className="text-xs">
                            Refund
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium ${tx.amount < 0 ? "text-red-600" : "text-green-600"}`}
                    >
                      {tx.amount < 0 ? "-" : "+"}
                      {formatCurrency(Math.abs(tx.amount))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Payout Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payout Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium mb-1">Payout Schedule</p>
              <p className="text-sm text-muted-foreground">
                Monthly on the 1st
              </p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Minimum Payout</p>
              <p className="text-sm text-muted-foreground">$50.00 USD</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Payment Method</p>
              <p className="text-sm text-muted-foreground">
                Bank Transfer (ACH)
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" asChild>
              <Link href="/dashboard/instructor/settings">
                Manage Payout Settings
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
