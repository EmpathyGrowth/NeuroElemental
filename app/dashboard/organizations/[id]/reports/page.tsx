"use client";

/**
 * Reports Page
 * List and manage generated reports
 */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { logger } from "@/lib/logging/logger";
import { cn } from "@/lib/utils";
import { format as formatDate } from "date-fns";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  Download,
  FileText,
  Plus,
  Trash2,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Report {
  id: string;
  type: string;
  start_date: string;
  end_date: string;
  format: string;
  include_raw_data: boolean;
  generated_at: string;
  generated_by: {
    full_name: string;
    email: string;
  };
}

export default function ReportsPage() {
  const params = useParams();
  const router = useRouter();
  const organizationId = params.id as string;

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Generate report form state
  const [reportType, setReportType] = useState<string>("Activity");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [format, setFormat] = useState<string>("JSON");
  const [includeRawData, setIncludeRawData] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [organizationId]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/organizations/${organizationId}/reports`);

      if (!res.ok) {
        throw new Error("Failed to fetch reports");
      }

      const data = await res.json();
      setReports(data.reports || []);
    } catch (error) {
      logger.error(
        "Error fetching reports",
        error instanceof Error ? error : undefined,
        { errorMsg: String(error) }
      );
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    if (endDate < startDate) {
      toast.error("End date must be after start date");
      return;
    }

    try {
      setGenerating(true);
      const res = await fetch(`/api/organizations/${organizationId}/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: reportType,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          format,
          include_raw_data: includeRawData,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to generate report");
      }

      const data = await res.json();
      setReports([data.report, ...reports]);

      // Reset form
      setReportType("Activity");
      setStartDate(undefined);
      setEndDate(undefined);
      setFormat("JSON");
      setIncludeRawData(false);
      setCreateDialogOpen(false);

      toast.success("Report Generated", {
        description: "Your report has been generated successfully",
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      logger.error(
        "Error generating report",
        error instanceof Error ? error : undefined,
        { errorMsg: String(error) }
      );
      toast.error(message || "Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  const handleExportReport = async (reportId: string) => {
    try {
      const res = await fetch(
        `/api/organizations/${organizationId}/reports/${reportId}/export`
      );

      if (!res.ok) {
        throw new Error("Failed to export report");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${reportId}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success("Report Exported", {
        description: "Report has been downloaded as CSV",
      });
    } catch (error) {
      logger.error(
        "Error exporting report",
        error instanceof Error ? error : undefined,
        { errorMsg: String(error) }
      );
      toast.error("Failed to export report");
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      const res = await fetch(
        `/api/organizations/${organizationId}/reports/${reportId}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to delete report");
      }

      setReports(reports.filter((r) => r.id !== reportId));

      toast.success("Report Deleted", {
        description: "The report has been permanently deleted",
      });
    } catch (error) {
      logger.error(
        "Error deleting report",
        error instanceof Error ? error : undefined,
        { errorMsg: String(error) }
      );
      toast.error("Failed to delete report");
    }
  };

  const getReportTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      Activity: "Activity Report",
      Usage: "Usage Report",
      Members: "Members Report",
    };
    return labels[type] || type;
  };

  const getReportTypeBadgeVariant = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      Activity: "default",
      Usage: "secondary",
      Members: "outline",
    };
    return variants[type] || "outline";
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              router.push(`/dashboard/organizations/${organizationId}`)
            }
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FileText className="h-8 w-8" />
              Reports
            </h1>
            <p className="text-muted-foreground mt-2">
              Generate and download organization reports
            </p>
          </div>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Generate New Report</DialogTitle>
              <DialogDescription>
                Configure report parameters and generate a new report
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="reportType">Report Type *</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger id="reportType" className="mt-2">
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Activity">Activity</SelectItem>
                    <SelectItem value="Usage">Usage</SelectItem>
                    <SelectItem value="Members">Members</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  The type of data to include in the report
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal mt-2",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate
                          ? formatDate(startDate, "PPP")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>End Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal mt-2",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? formatDate(endDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div>
                <Label htmlFor="format">Export Format *</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger id="format" className="mt-2">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JSON">JSON</SelectItem>
                    <SelectItem value="CSV">CSV</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Format for the exported data file
                </p>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="includeRawData"
                  checked={includeRawData}
                  onCheckedChange={(checked) =>
                    setIncludeRawData(checked as boolean)
                  }
                />
                <div className="flex-1">
                  <Label htmlFor="includeRawData" className="cursor-pointer">
                    Include raw data
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Include detailed raw data in the report export
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerateReport}
                disabled={generating || !startDate || !endDate}
              >
                {generating ? "Generating..." : "Generate Report"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              Loading reports...
            </p>
          </CardContent>
        </Card>
      ) : reports.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Reports</h3>
              <p className="text-muted-foreground mb-4">
                Generate your first report to get started
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">
                        {getReportTypeLabel(report.type)}
                      </CardTitle>
                      <Badge variant={getReportTypeBadgeVariant(report.type)}>
                        {report.type}
                      </Badge>
                      <Badge variant="outline">{report.format}</Badge>
                    </div>
                    <CardDescription className="mt-2">
                      {formatDate(new Date(report.start_date), "PPP")} -{" "}
                      {formatDate(new Date(report.end_date), "PPP")}
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportReport(report.id)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Report?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the report. This action
                            cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteReport(report.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete Permanently
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Generated At
                    </Label>
                    <p className="font-medium mt-1">
                      {formatDate(new Date(report.generated_at), "PPP")}
                    </p>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Generated By
                    </Label>
                    <p className="font-medium mt-1">
                      {report.generated_by.full_name ||
                        report.generated_by.email}
                    </p>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Format
                    </Label>
                    <p className="font-medium mt-1">{report.format}</p>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Raw Data
                    </Label>
                    <p className="font-medium mt-1">
                      {report.include_raw_data ? "Included" : "Not included"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
