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
import { Column, DataTable } from "@/components/ui/data-table";
import { useAsync } from "@/hooks/use-async";
import { formatDate } from "@/lib/utils";
import { Eye, EyeOff, Plus, Star } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  quote: string;
  element: string | null;
  is_published: boolean | null;
  is_verified: boolean | null;
  display_order: number | null;
  created_at: string | null;
}

// Elemental colors matching the brand's neurodivergent energy types
const elementStyles: Record<string, string> = {
  Electric: "bg-violet-500/10 text-violet-500 border-violet-500/20",
  Fire: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  Water: "bg-sky-500/10 text-sky-500 border-sky-500/20",
  Earth: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  Air: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  Metal: "bg-slate-500/10 text-slate-500 border-slate-500/20",
};

const getElementStyle = (element: string | null): string => {
  if (!element) return "";
  return (
    elementStyles[element] || "bg-primary/10 text-primary border-primary/20"
  );
};

export default function AdminTestimonialsPage() {
  const { data: testimonials, loading, execute } = useAsync<Testimonial[]>();

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = () =>
    execute(async () => {
      const response = await fetch("/api/admin/testimonials");
      if (!response.ok) throw new Error("Failed to fetch testimonials");
      const result = await response.json();
      return result.testimonials || [];
    });

  const columns: Column<Testimonial>[] = [
    {
      id: "name",
      header: "Author",
      cell: (testimonial) => (
        <div>
          <div className="font-medium">{testimonial.name}</div>
          {testimonial.role && (
            <div className="text-sm text-muted-foreground">
              {testimonial.role}
            </div>
          )}
        </div>
      ),
      sortable: true,
    },
    {
      id: "quote",
      header: "Quote",
      cell: (testimonial) => (
        <p className="text-sm line-clamp-2">{testimonial.quote}</p>
      ),
    },
    {
      id: "element",
      header: "Element",
      cell: (testimonial) =>
        testimonial.element ? (
          <Badge className={getElementStyle(testimonial.element)}>
            {testimonial.element}
          </Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      id: "status",
      header: "Status",
      cell: (testimonial) => (
        <div className="flex gap-2">
          {testimonial.is_published ? (
            <Badge variant="default">
              <Eye className="w-3 h-3 mr-1" />
              Published
            </Badge>
          ) : (
            <Badge variant="secondary">
              <EyeOff className="w-3 h-3 mr-1" />
              Draft
            </Badge>
          )}
          {testimonial.is_verified && (
            <Badge variant="default" className="bg-green-600">
              <Star className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>
      ),
    },
    {
      id: "display_order",
      header: "Order",
      cell: (testimonial) => testimonial.display_order || 0,
      sortable: true,
    },
    {
      id: "created",
      header: "Created",
      cell: (testimonial) =>
        testimonial.created_at ? formatDate(testimonial.created_at) : "-",
      sortable: true,
    },
  ];

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <DashboardHeader
        title="Testimonials"
        subtitle="Manage user testimonials and success stories"
        actions={
          <Button asChild>
            <Link href="/dashboard/admin/testimonials/new">
              <Plus className="w-4 h-4 mr-2" />
              Add Testimonial
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>All Testimonials</CardTitle>
          <CardDescription>
            {testimonials?.length || 0} testimonials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={testimonials || []}
            columns={columns}
            keyField="id"
            loading={loading}
            emptyTitle="No testimonials yet"
            emptyDescription="Add your first testimonial to showcase user success stories"
          />
        </CardContent>
      </Card>
    </div>
  );
}
