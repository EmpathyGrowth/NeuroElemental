"use client";

/**
 * Purchase Credits Page
 * Buy credits for organization
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, CheckCircle2, Coins, Package } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  popular?: boolean;
  savings?: string;
}

const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: "starter",
    name: "Starter",
    credits: 10,
    price: 99,
  },
  {
    id: "professional",
    name: "Professional",
    credits: 50,
    price: 449,
    popular: true,
    savings: "Save 10%",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    credits: 100,
    price: 799,
    savings: "Save 20%",
  },
];

export default function PurchaseCreditsPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.id as string;

  const [selectedPackage, setSelectedPackage] =
    useState<string>("professional");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [useCustomAmount, setUseCustomAmount] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const selectedPkg = CREDIT_PACKAGES.find((p) => p.id === selectedPackage);
  const credits = useCustomAmount
    ? parseInt(customAmount) || 0
    : selectedPkg?.credits || 0;
  const basePrice = useCustomAmount
    ? (parseInt(customAmount) || 0) * 10 // $10 per credit
    : selectedPkg?.price || 0;

  let finalPrice = basePrice;
  if (appliedCoupon) {
    if (appliedCoupon.discount_type === "percentage") {
      finalPrice = basePrice * (1 - appliedCoupon.discount_value / 100);
    } else if (appliedCoupon.discount_type === "fixed_amount") {
      finalPrice = Math.max(0, basePrice - appliedCoupon.discount_value);
    }
  }

  const handleValidateCoupon = async () => {
    if (!couponCode) return;

    setValidatingCoupon(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode,
          organization_id: orgId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Invalid coupon");
      }

      const data = await res.json();
      setAppliedCoupon(data.coupon);

      toast.success("Coupon Applied", {
        description: `${couponCode} has been applied`,
      });
    } catch (err) {
      toast.error("Invalid Coupon", {
        description: err instanceof Error ? err.message : "Coupon not found",
      });
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handlePurchase = async () => {
    if (credits === 0) {
      toast.error("Error", {
        description: "Please select a credit package",
      });
      return;
    }

    setProcessing(true);

    try {
      // In production, integrate with Stripe or your payment provider
      const res = await fetch(`/api/organizations/${orgId}/credits/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credits,
          price: finalPrice,
          coupon_code: appliedCoupon?.code,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to purchase credits");
      }

      toast.success("Success", {
        description: `${credits} credits have been added to your organization`,
      });

      setTimeout(() => {
        router.push(`/dashboard/organizations/${orgId}`);
      }, 1500);
    } catch (err) {
      toast.error("Error", {
        description:
          err instanceof Error ? err.message : "Failed to purchase credits",
      });
      setProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/dashboard/organizations/${orgId}`)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Organization
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            Purchase Credits
          </h1>
          <p className="text-muted-foreground">
            Add credits to your organization for course enrollments
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Package Selection */}
          <div className="md:col-span-2 space-y-6">
            {/* Credit Packages */}
            <Card>
              <CardHeader>
                <CardTitle>Select Package</CardTitle>
                <CardDescription>
                  Choose a credit package for your team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup
                  value={useCustomAmount ? "custom" : selectedPackage}
                  onValueChange={(value) => {
                    if (value === "custom") {
                      setUseCustomAmount(true);
                    } else {
                      setUseCustomAmount(false);
                      setSelectedPackage(value);
                    }
                  }}
                >
                  <div className="grid gap-4 md:grid-cols-3">
                    {CREDIT_PACKAGES.map((pkg) => (
                      <div key={pkg.id} className="relative">
                        {pkg.popular && (
                          <Badge
                            className="absolute -top-2 left-1/2 -translate-x-1/2"
                            variant="default"
                          >
                            Popular
                          </Badge>
                        )}
                        <label
                          htmlFor={pkg.id}
                          className={`flex flex-col items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                            selectedPackage === pkg.id && !useCustomAmount
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <RadioGroupItem
                            value={pkg.id}
                            id={pkg.id}
                            className="sr-only"
                          />
                          <Package className="h-8 w-8 text-primary" />
                          <div className="text-center">
                            <div className="font-semibold">{pkg.name}</div>
                            <div className="text-2xl font-bold mt-1">
                              {pkg.credits}
                              <span className="text-sm text-muted-foreground ml-1">
                                credits
                              </span>
                            </div>
                            <div className="text-lg font-semibold mt-2">
                              ${pkg.price}
                            </div>
                            {pkg.savings && (
                              <Badge variant="secondary" className="mt-2">
                                {pkg.savings}
                              </Badge>
                            )}
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>

                  {/* Custom Amount */}
                  <div className="pt-4">
                    <label
                      htmlFor="custom"
                      className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        useCustomAmount
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <RadioGroupItem value="custom" id="custom" />
                      <div className="flex-1">
                        <div className="font-medium">Custom Amount</div>
                        <p className="text-sm text-muted-foreground">
                          Choose your own credit amount ($10/credit)
                        </p>
                      </div>
                      {useCustomAmount && (
                        <Input
                          type="number"
                          min="1"
                          placeholder="Enter amount"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          className="w-32"
                        />
                      )}
                    </label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Coupon Code */}
            <Card>
              <CardHeader>
                <CardTitle>Coupon Code</CardTitle>
                <CardDescription>
                  Have a promotional code? Apply it here
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) =>
                      setCouponCode(e.target.value.toUpperCase())
                    }
                    disabled={!!appliedCoupon}
                    className="font-mono"
                  />
                  {appliedCoupon ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setAppliedCoupon(null);
                        setCouponCode("");
                      }}
                    >
                      Remove
                    </Button>
                  ) : (
                    <Button
                      onClick={handleValidateCoupon}
                      disabled={!couponCode || validatingCoupon}
                    >
                      {validatingCoupon ? "Validating..." : "Apply"}
                    </Button>
                  )}
                </div>
                {appliedCoupon && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>
                      Coupon applied:{" "}
                      {appliedCoupon.discount_type === "percentage"
                        ? `${appliedCoupon.discount_value}% off`
                        : `$${appliedCoupon.discount_value} off`}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Credits</span>
                    <span className="font-medium">{credits}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Price per credit
                    </span>
                    <span className="font-medium">
                      $
                      {useCustomAmount
                        ? "10.00"
                        : (basePrice / credits).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">${basePrice.toFixed(2)}</span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-${(basePrice - finalPrice).toFixed(2)}</span>
                    </div>
                  )}

                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold">Total</span>
                      <span className="text-2xl font-bold">
                        ${finalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handlePurchase}
                  disabled={processing || credits === 0}
                  className="w-full"
                  size="lg"
                >
                  <Coins className="h-4 w-4 mr-2" />
                  {processing ? "Processing..." : `Purchase ${credits} Credits`}
                </Button>

                <div className="text-xs text-muted-foreground text-center">
                  Credits never expire and can be used for any course
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Benefits */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-base">What You Get</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>One credit per course enrollment</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Credits never expire</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Share credits across your team</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Detailed usage tracking and analytics</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Priority support for organizations</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
