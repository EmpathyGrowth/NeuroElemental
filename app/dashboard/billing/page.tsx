import { redirect } from "next/navigation";

/**
 * Billing Index Page
 * Redirects to the plans page as the main billing entry point
 */
export default function BillingPage() {
  redirect("/dashboard/billing/plans");
}
