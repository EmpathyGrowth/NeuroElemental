"use client";

/**
 * Organization Billing Dashboard
 * Main billing page showing subscription, usage, payment method, and plan management
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { logger } from "@/lib/logging/logger";
import { formatDate } from "@/lib/utils";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  CreditCard,
  Crown,
  DollarSign,
  Download,
  ExternalLink,
  Info,
  Shield,
  Zap,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  tier: string;
  price_cents: number;
  currency: string;
  billing_interval: string;
  features: string[];
  requests_per_minute: number;
  requests_per_hour: number;
  requests_per_day: number;
  max_members: number | null;
  max_api_keys: number | null;
  max_webhooks: number | null;
  storage_gb: number | null;
  trial_days: number;
  is_featured: boolean;
}

interface OrganizationSubscription {
  id: string;
  organization_id: string;
  plan_id: string | null;
  stripe_subscription_id: string | null;
  stripe_customer_id: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  trial_end: string | null;
  payment_method_last4: string | null;
  payment_method_brand: string | null;
}

interface PaymentMethod {
  id: string;
  card_brand: string | null;
  card_last4: string | null;
  card_exp_month: number | null;
  card_exp_year: number | null;
  is_default: boolean;
}

interface Invoice {
  id: string;
  invoice_number: string | null;
  amount_cents: number;
  status: string;
  paid: boolean;
  invoice_date: string;
  invoice_pdf: string | null;
  hosted_invoice_url: string | null;
}

interface UpcomingInvoice {
  amount_due: number;
  currency: string;
  next_payment_attempt: string | null;
  period_start: string;
  period_end: string;
}

interface BillingData {
  subscription: OrganizationSubscription | null;
  plan: SubscriptionPlan | null;
  paymentMethod: PaymentMethod | null;
  upcomingInvoice: UpcomingInvoice | null;
}

export default function BillingDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.id as string;

  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [allPlans, setAllPlans] = useState<SubscriptionPlan[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [changePlanDialog, setChangePlanDialog] = useState(false);
  const [selectedNewPlan, setSelectedNewPlan] =
    useState<SubscriptionPlan | null>(null);
  const [prorationAmount, setProrationAmount] = useState<number | null>(null);

  useEffect(() => {
    fetchBillingData();
    fetchPlans();
    fetchRecentInvoices();
  }, [orgId]);

  const fetchBillingData = async () => {
    try {
      const res = await fetch(`/api/organizations/${orgId}/billing`);
      if (!res.ok) throw new Error("Failed to fetch billing data");
      const data = await res.json();
      setBillingData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error("Error", {
        description: "Failed to load billing information",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/billing/plans");
      if (!res.ok) throw new Error("Failed to fetch plans");
      const data = await res.json();
      setAllPlans(data.plans || []);
    } catch (err) {
      logger.error(
        "Error fetching plans",
        err instanceof Error ? err : undefined,
        { errorMsg: String(err) }
      );
    }
  };

  const fetchRecentInvoices = async () => {
    try {
      const res = await fetch(
        `/api/organizations/${orgId}/billing/invoices?limit=5`
      );
      if (!res.ok) throw new Error("Failed to fetch invoices");
      const data = await res.json();
      setRecentInvoices(data.invoices || []);
    } catch (err) {
      logger.error(
        "Error fetching invoices",
        err instanceof Error ? err : undefined,
        { errorMsg: String(err) }
      );
    }
  };

  const handleOpenBillingPortal = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/organizations/${orgId}/billing/portal`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to create portal session");
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (_err) {
      toast.error("Error", {
        description: "Failed to open billing portal",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangePlan = async () => {
    if (!selectedNewPlan) return;

    setActionLoading(true);
    try {
      const res = await fetch(
        `/api/organizations/${orgId}/billing/change-plan`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan_id: selectedNewPlan.id }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to change plan");
      }

      toast.success("Success", {
        description: `Successfully changed to ${selectedNewPlan.name} plan`,
      });

      setChangePlanDialog(false);
      setSelectedNewPlan(null);
      fetchBillingData();
    } catch (err) {
      toast.error("Error", {
        description:
          err instanceof Error ? err.message : "Failed to change plan",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelSubscription = async (immediately: boolean) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/organizations/${orgId}/billing/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancel_immediately: immediately }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to cancel subscription");
      }

      toast.success("Success", {
        description: immediately
          ? "Subscription canceled immediately"
          : "Subscription will cancel at period end",
      });

      fetchBillingData();
    } catch (err) {
      toast.error("Error", {
        description:
          err instanceof Error ? err.message : "Failed to cancel subscription",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(
        `/api/organizations/${orgId}/billing/reactivate`,
        {
          method: "POST",
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to reactivate subscription");
      }

      toast.success("Success", {
        description: "Subscription reactivated successfully",
      });

      fetchBillingData();
    } catch (err) {
      toast.error("Error", {
        description:
          err instanceof Error
            ? err.message
            : "Failed to reactivate subscription",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const openChangePlanDialog = async (plan: SubscriptionPlan) => {
    setSelectedNewPlan(plan);
    setChangePlanDialog(true);

    // Calculate proration if there's an active subscription
    if (billingData?.subscription?.stripe_subscription_id) {
      try {
        const res = await fetch(
          `/api/organizations/${orgId}/billing/change-plan`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ plan_id: plan.id, preview: true }),
          }
        );
        if (res.ok) {
          const data = await res.json();
          setProrationAmount(data.proration_amount || null);
        }
      } catch (err) {
        logger.error(
          "Error calculating proration",
          err instanceof Error ? err : undefined,
          { errorMsg: String(err) }
        );
      }
    }
  };

  const formatPrice = (cents: number, currency: string = "usd") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<
      string,
      {
        label: string;
        variant: "default" | "secondary" | "destructive" | "outline";
      }
    > = {
      active: { label: "Active", variant: "default" },
      trialing: { label: "Trialing", variant: "secondary" },
      past_due: { label: "Past Due", variant: "destructive" },
      canceled: { label: "Canceled", variant: "outline" },
      incomplete: { label: "Incomplete", variant: "destructive" },
    };
    const badge = badges[status] || { label: status, variant: "outline" };
    return <Badge variant={badge.variant}>{badge.label}</Badge>;
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "free":
        return <Zap className="h-5 w-5" />;
      case "starter":
        return <Zap className="h-5 w-5" />;
      case "pro":
        return <Shield className="h-5 w-5" />;
      case "enterprise":
        return <Crown className="h-5 w-5" />;
      default:
        return <Zap className="h-5 w-5" />;
    }
  };

  const getDaysRemainingInPeriod = () => {
    if (!billingData?.subscription?.current_period_end) return 0;
    const endDate = new Date(billingData.subscription.current_period_end);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getBillingCycleProgress = () => {
    if (
      !billingData?.subscription?.current_period_start ||
      !billingData?.subscription?.current_period_end
    ) {
      return 0;
    }
    const start = new Date(
      billingData.subscription.current_period_start
    ).getTime();
    const end = new Date(billingData.subscription.current_period_end).getTime();
    const now = Date.now();
    return Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-6 text-destructive">{error}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/dashboard/organizations/${orgId}`)}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">
              Billing & Subscription
            </h1>
            <p className="text-muted-foreground">
              Manage your subscription, payment methods, and invoices
            </p>
          </div>
        </div>

        {/* Current Plan & Payment Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Current Plan Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Current Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {billingData?.plan ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getTierIcon(billingData.plan.tier)}
                      <h3 className="text-2xl font-bold">
                        {billingData.plan.name}
                      </h3>
                    </div>
                    <Badge
                      variant={
                        billingData.plan.is_featured ? "default" : "outline"
                      }
                    >
                      {billingData.plan.tier}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold">
                      {formatPrice(
                        billingData.plan.price_cents,
                        billingData.plan.currency
                      )}
                      <span className="text-sm font-normal text-muted-foreground">
                        /{billingData.plan.billing_interval}
                      </span>
                    </div>
                    {billingData.subscription && (
                      <div className="flex items-center gap-2">
                        {getStatusBadge(billingData.subscription.status)}
                      </div>
                    )}
                  </div>
                  {billingData.subscription?.cancel_at_period_end && (
                    <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-900">
                      <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                      <div className="text-sm text-yellow-800 dark:text-yellow-200">
                        Subscription will cancel on{" "}
                        {billingData.subscription.current_period_end &&
                          formatDate(
                            billingData.subscription.current_period_end
                          )}
                      </div>
                    </div>
                  )}
                  {billingData.subscription?.current_period_end &&
                    !billingData.subscription.cancel_at_period_end && (
                      <div className="text-sm text-muted-foreground">
                        Next billing date:{" "}
                        {formatDate(
                          billingData.subscription.current_period_end
                        )}
                      </div>
                    )}
                  <div className="pt-2 space-y-2">
                    {billingData.subscription?.cancel_at_period_end ? (
                      <Button
                        onClick={handleReactivateSubscription}
                        disabled={actionLoading}
                        className="w-full"
                      >
                        Reactivate Subscription
                      </Button>
                    ) : (
                      <Button
                        onClick={handleOpenBillingPortal}
                        disabled={actionLoading}
                        className="w-full"
                      >
                        Manage Billing
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">
                      No active subscription
                    </p>
                  </div>
                  <Button
                    onClick={() => router.push("/dashboard/billing/plans")}
                    className="w-full"
                  >
                    View Plans
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Usage Overview Card */}
          {billingData?.subscription &&
            billingData.subscription.status !== "canceled" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Billing Cycle
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {billingData.subscription.current_period_start &&
                    billingData.subscription.current_period_end && (
                      <>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Current Period
                            </span>
                            <span className="font-medium">
                              {getDaysRemainingInPeriod()} days left
                            </span>
                          </div>
                          <Progress
                            value={getBillingCycleProgress()}
                            className="h-2"
                          />
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Started
                            </span>
                            <span>
                              {formatDate(
                                billingData.subscription.current_period_start
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Ends</span>
                            <span>
                              {formatDate(
                                billingData.subscription.current_period_end
                              )}
                            </span>
                          </div>
                        </div>
                        {billingData.upcomingInvoice && (
                          <div className="pt-4 border-t">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                Next Invoice
                              </span>
                              <span className="font-medium">
                                {formatPrice(
                                  billingData.upcomingInvoice.amount_due,
                                  billingData.upcomingInvoice.currency
                                )}
                              </span>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                </CardContent>
              </Card>
            )}

          {/* Payment Method Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {billingData?.paymentMethod ? (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium capitalize">
                        {billingData.paymentMethod.card_brand} ••••{" "}
                        {billingData.paymentMethod.card_last4}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Expires {billingData.paymentMethod.card_exp_month}/
                      {billingData.paymentMethod.card_exp_year}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleOpenBillingPortal}
                    disabled={actionLoading}
                    className="w-full"
                  >
                    Update Payment Method
                  </Button>
                </>
              ) : billingData?.subscription ? (
                <>
                  <div className="text-center py-6">
                    <p className="text-muted-foreground text-sm">
                      No payment method on file
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleOpenBillingPortal}
                    disabled={actionLoading}
                    className="w-full"
                  >
                    Add Payment Method
                  </Button>
                </>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground text-sm">
                    Subscribe to a plan to add a payment method
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Available Plans Section */}
        <Card>
          <CardHeader>
            <CardTitle>Available Plans</CardTitle>
            <CardDescription>
              Choose the plan that best fits your organization's needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {allPlans.map((plan) => {
                const isCurrentPlan = billingData?.plan?.id === plan.id;
                return (
                  <Card
                    key={plan.id}
                    className={isCurrentPlan ? "border-primary" : ""}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getTierIcon(plan.tier)}
                          <CardTitle className="text-lg">{plan.name}</CardTitle>
                        </div>
                        {plan.is_featured && <Badge>Popular</Badge>}
                      </div>
                      <div className="space-y-1">
                        <div className="text-3xl font-bold">
                          {formatPrice(plan.price_cents, plan.currency)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          per {plan.billing_interval}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        {plan.features.slice(0, 5).map((feature, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 text-sm"
                          >
                            <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                        {plan.features.length > 5 && (
                          <div className="text-sm text-muted-foreground">
                            +{plan.features.length - 5} more features
                          </div>
                        )}
                      </div>
                      {isCurrentPlan ? (
                        <Button disabled className="w-full">
                          Current Plan
                        </Button>
                      ) : plan.tier === "enterprise" ? (
                        <Button variant="outline" className="w-full">
                          Contact Sales
                        </Button>
                      ) : billingData?.subscription ? (
                        <Button
                          variant="outline"
                          onClick={() => openChangePlanDialog(plan)}
                          disabled={actionLoading}
                          className="w-full"
                        >
                          {plan.price_cents >
                          (billingData.plan?.price_cents || 0)
                            ? "Upgrade"
                            : "Downgrade"}
                        </Button>
                      ) : (
                        <Button
                          onClick={() =>
                            router.push(
                              `/api/organizations/${orgId}/billing/checkout?plan_id=${plan.id}`
                            )
                          }
                          className="w-full"
                        >
                          Get Started
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Invoices Section */}
        {recentInvoices.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Invoices</CardTitle>
                  <CardDescription>
                    Your latest billing invoices
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    router.push(
                      `/dashboard/organizations/${orgId}/billing/invoices`
                    )
                  }
                >
                  View All Invoices
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-mono text-sm">
                          {invoice.invoice_number || invoice.id.slice(0, 8)}
                        </TableCell>
                        <TableCell>
                          {formatDate(invoice.invoice_date)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatPrice(invoice.amount_cents)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={invoice.paid ? "default" : "destructive"}
                          >
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {invoice.invoice_pdf && (
                              <Button variant="ghost" size="sm" asChild>
                                <a
                                  href={invoice.invoice_pdf}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Download className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                            {invoice.hosted_invoice_url && (
                              <Button variant="ghost" size="sm" asChild>
                                <a
                                  href={invoice.hosted_invoice_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cancel Subscription Section */}
        {billingData?.subscription &&
          !billingData.subscription.cancel_at_period_end && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">
                  Cancel Subscription
                </CardTitle>
                <CardDescription>
                  Cancel your subscription to stop future billing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      You can cancel at any time. Your subscription will remain
                      active until the end of the current billing period.
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        Cancel Subscription
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Cancel Subscription?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Your subscription will remain active until{" "}
                          {billingData.subscription.current_period_end &&
                            formatDate(
                              billingData.subscription.current_period_end
                            )}
                          . You can reactivate it at any time before then.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleCancelSubscription(false)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Cancel Subscription
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          )}
      </div>

      {/* Change Plan Dialog */}
      <Dialog open={changePlanDialog} onOpenChange={setChangePlanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Subscription Plan</DialogTitle>
            <DialogDescription>
              {selectedNewPlan &&
                `Switch to the ${selectedNewPlan.name} plan (${formatPrice(
                  selectedNewPlan.price_cents,
                  selectedNewPlan.currency
                )}/${selectedNewPlan.billing_interval})`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {prorationAmount !== null && (
              <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-900">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  Proration amount: {formatPrice(prorationAmount)}
                  {prorationAmount > 0
                    ? " will be charged immediately"
                    : " will be credited to your account"}
                </div>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Your plan will be updated immediately, and you'll be charged or
              credited a prorated amount based on your current billing cycle.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setChangePlanDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleChangePlan} disabled={actionLoading}>
              {actionLoading ? "Processing..." : "Confirm Change"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
