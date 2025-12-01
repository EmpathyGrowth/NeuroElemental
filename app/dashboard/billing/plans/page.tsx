"use client";

/**
 * Public Pricing Page
 * Displays all available subscription plans with comparison and FAQ
 */

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAsync } from "@/hooks/use-async";
import {
  ArrowLeft,
  Building2,
  Check,
  Crown,
  Info,
  Shield,
  X,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
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
  is_active: boolean;
}

const faqs = [
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, American Express, Discover) through our secure payment processor, Stripe. All payments are encrypted and secure.",
  },
  {
    question: "Can I change my plan later?",
    answer:
      "Yes! You can upgrade or downgrade your plan at any time. When you upgrade, you'll be charged a prorated amount for the remainder of your billing cycle. When you downgrade, you'll receive a credit applied to your next invoice.",
  },
  {
    question: "What happens when I reach my usage limits?",
    answer:
      "If you reach your rate limits, your API requests will be temporarily throttled until the next time window. We recommend upgrading to a higher tier if you consistently hit your limits. We'll send you notifications as you approach your limits.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "Yes! Most paid plans include a free trial period. You can cancel anytime during the trial and won't be charged. After the trial ends, your payment method will be charged automatically.",
  },
  {
    question: "How does billing work?",
    answer:
      "Billing is handled automatically on a monthly or yearly basis, depending on your chosen plan. You'll receive an invoice by email after each billing cycle. You can view and download all your invoices from your billing dashboard.",
  },
  {
    question: "Can I cancel my subscription?",
    answer:
      "Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period, and you won't be charged again. You can reactivate your subscription anytime before the period ends.",
  },
  {
    question: "Do you offer custom enterprise plans?",
    answer:
      "Yes! Our Enterprise plan can be customized to meet your specific needs, including custom rate limits, dedicated support, SLAs, and more. Contact our sales team to discuss your requirements.",
  },
  {
    question: "What kind of support do you offer?",
    answer:
      "Support varies by plan tier. Free plans have community support, Starter includes email support, Pro includes priority email support, and Enterprise includes dedicated support with phone and video calls.",
  },
];

export default function PricingPlansPage() {
  const router = useRouter();

  const {
    data: plans,
    loading,
    error,
    execute,
  } = useAsync<SubscriptionPlan[]>();
  const [yearlyBilling, setYearlyBilling] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    if (error) {
      toast.error("Error", {
        description: "Failed to load pricing plans",
      });
    }
  }, [error]);

  const fetchPlans = () =>
    execute(async () => {
      const res = await fetch("/api/billing/plans");
      if (!res.ok) throw new Error("Failed to fetch plans");
      const result = await res.json();
      return result.plans || [];
    });

  const formatPrice = (cents: number, currency: string = "usd") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  const getYearlyPrice = (monthlyCents: number) => {
    // 20% discount for yearly billing
    return monthlyCents * 12 * 0.8;
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "free":
        return <Zap className="h-6 w-6" />;
      case "starter":
        return <Zap className="h-6 w-6" />;
      case "pro":
        return <Shield className="h-6 w-6" />;
      case "enterprise":
        return <Crown className="h-6 w-6" />;
      default:
        return <Zap className="h-6 w-6" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "free":
        return "bg-gray-100 dark:bg-gray-800";
      case "starter":
        return "bg-blue-50 dark:bg-blue-900/20";
      case "pro":
        return "bg-purple-50 dark:bg-purple-900/20";
      case "enterprise":
        return "bg-amber-50 dark:bg-amber-900/20";
      default:
        return "bg-gray-100 dark:bg-gray-800";
    }
  };

  // Group plans by billing interval (monthly/yearly)
  const monthlyPlans = (plans || []).filter(
    (p) => p.billing_interval === "month"
  );
  const _yearlyPlans = (plans || []).filter(
    (p) => p.billing_interval === "year"
  );

  // For display, we'll use monthly plans and calculate yearly pricing
  const displayPlans = monthlyPlans.length > 0 ? monthlyPlans : plans || [];

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="space-y-8">
          <Skeleton className="h-24 w-full" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Flexible pricing for organizations of all sizes. Start free and
            scale as you grow.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 pt-6">
            <Label
              htmlFor="billing-toggle"
              className={!yearlyBilling ? "font-semibold" : ""}
            >
              Monthly
            </Label>
            <Switch
              id="billing-toggle"
              checked={yearlyBilling}
              onCheckedChange={setYearlyBilling}
            />
            <Label
              htmlFor="billing-toggle"
              className={yearlyBilling ? "font-semibold" : ""}
            >
              Yearly
            </Label>
            {yearlyBilling && (
              <Badge variant="secondary" className="ml-2">
                Save 20%
              </Badge>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {displayPlans.map((plan) => {
            const displayPrice = yearlyBilling
              ? getYearlyPrice(plan.price_cents)
              : plan.price_cents;
            const displayInterval = yearlyBilling
              ? "year"
              : plan.billing_interval;

            return (
              <Card
                key={plan.id}
                className={`relative ${plan.is_featured ? "border-primary shadow-lg" : ""}`}
              >
                {plan.is_featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="px-3">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className={getTierColor(plan.tier)}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getTierIcon(plan.tier)}
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">
                        {plan.price_cents === 0
                          ? "Free"
                          : formatPrice(displayPrice, plan.currency)}
                      </span>
                      {plan.price_cents > 0 && (
                        <span className="text-muted-foreground">
                          /{displayInterval}
                        </span>
                      )}
                    </div>
                    {yearlyBilling && plan.price_cents > 0 && (
                      <div className="text-sm text-muted-foreground">
                        {formatPrice(plan.price_cents, plan.currency)}/month
                        billed yearly
                      </div>
                    )}
                  </div>
                  <CardDescription className="min-h-[3rem]">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  {/* Features List */}
                  <div className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Usage Limits */}
                  <div className="pt-4 border-t space-y-2 text-sm">
                    <div className="font-medium text-muted-foreground">
                      Usage Limits
                    </div>
                    <div className="space-y-1 text-muted-foreground">
                      <div>{plan.requests_per_minute} requests/min</div>
                      <div>{plan.requests_per_hour} requests/hour</div>
                      <div>{plan.requests_per_day} requests/day</div>
                      {plan.max_members && (
                        <div>Up to {plan.max_members} members</div>
                      )}
                      {plan.max_api_keys && (
                        <div>Up to {plan.max_api_keys} API keys</div>
                      )}
                      {plan.max_webhooks && (
                        <div>Up to {plan.max_webhooks} webhooks</div>
                      )}
                      {plan.storage_gb && (
                        <div>{plan.storage_gb}GB storage</div>
                      )}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="pt-4">
                    {plan.tier === "enterprise" ? (
                      <Button variant="outline" className="w-full" size="lg">
                        <Building2 className="h-4 w-4 mr-2" />
                        Contact Sales
                      </Button>
                    ) : plan.price_cents === 0 ? (
                      <Button
                        variant="outline"
                        className="w-full"
                        size="lg"
                        onClick={() =>
                          router.push("/dashboard/organizations/new")
                        }
                      >
                        Get Started
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        variant={plan.is_featured ? "default" : "outline"}
                        size="lg"
                        onClick={() =>
                          router.push("/dashboard/organizations/new")
                        }
                      >
                        Start Free Trial
                      </Button>
                    )}
                  </div>

                  {plan.trial_days > 0 && plan.price_cents > 0 && (
                    <div className="text-xs text-center text-muted-foreground">
                      {plan.trial_days}-day free trial included
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">Compare Plans</h2>
            <p className="text-muted-foreground">
              See all features side-by-side to find the perfect plan for your
              needs
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-64">Feature</TableHead>
                      {displayPlans.map((plan) => (
                        <TableHead key={plan.id} className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            {getTierIcon(plan.tier)}
                            <span className="font-semibold">{plan.name}</span>
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Price</TableCell>
                      {displayPlans.map((plan) => (
                        <TableCell key={plan.id} className="text-center">
                          {plan.price_cents === 0
                            ? "Free"
                            : formatPrice(
                                yearlyBilling
                                  ? getYearlyPrice(plan.price_cents)
                                  : plan.price_cents,
                                plan.currency
                              )}
                          {plan.price_cents > 0 &&
                            `/${yearlyBilling ? "year" : "month"}`}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        Requests per minute
                      </TableCell>
                      {displayPlans.map((plan) => (
                        <TableCell key={plan.id} className="text-center">
                          {plan.requests_per_minute.toLocaleString()}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableCell className="font-medium">
                      Requests per hour
                    </TableCell>
                    {displayPlans.map((plan) => (
                      <TableCell key={plan.id} className="text-center">
                        {plan.requests_per_hour.toLocaleString()}
                      </TableCell>
                    ))}
                    <TableRow>
                      <TableCell className="font-medium">
                        Requests per day
                      </TableCell>
                      {displayPlans.map((plan) => (
                        <TableCell key={plan.id} className="text-center">
                          {plan.requests_per_day.toLocaleString()}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Max members</TableCell>
                      {displayPlans.map((plan) => (
                        <TableCell key={plan.id} className="text-center">
                          {plan.max_members === null
                            ? "Unlimited"
                            : plan.max_members}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        Max API keys
                      </TableCell>
                      {displayPlans.map((plan) => (
                        <TableCell key={plan.id} className="text-center">
                          {plan.max_api_keys === null
                            ? "Unlimited"
                            : plan.max_api_keys}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        Max webhooks
                      </TableCell>
                      {displayPlans.map((plan) => (
                        <TableCell key={plan.id} className="text-center">
                          {plan.max_webhooks === null
                            ? "Unlimited"
                            : plan.max_webhooks}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Storage</TableCell>
                      {displayPlans.map((plan) => (
                        <TableCell key={plan.id} className="text-center">
                          {plan.storage_gb === null
                            ? "Unlimited"
                            : `${plan.storage_gb}GB`}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Free trial</TableCell>
                      {displayPlans.map((plan) => (
                        <TableCell key={plan.id} className="text-center">
                          {plan.trial_days > 0 ? (
                            <div className="flex items-center justify-center gap-1">
                              <Check className="h-4 w-4 text-green-600" />
                              <span>{plan.trial_days} days</span>
                            </div>
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground mx-auto" />
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">
              Everything you need to know about our pricing and plans
            </p>
          </div>

          <Card className="max-w-4xl mx-auto">
            <CardContent className="pt-6">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, idx) => (
                  <AccordionItem key={idx} value={`item-${idx}`}>
                    <AccordionTrigger className="text-left">
                      <span className="font-semibold">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Trust Section */}
        <div className="text-center space-y-4 py-12 border-t">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Info className="h-5 w-5" />
            <p>
              All plans include 256-bit SSL encryption and SOC 2 Type II
              compliance
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Have questions? Contact our sales team at{" "}
            <a
              href="mailto:sales@neuroelemental.com"
              className="text-primary hover:underline"
            >
              sales@neuroelemental.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
