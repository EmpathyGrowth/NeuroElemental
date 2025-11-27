/**
 * Billing & Subscriptions Tables Migration
 * Stripe integration for recurring revenue
 */

-- Subscription plans (product catalog)
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Stripe integration
  stripe_product_id TEXT UNIQUE NOT NULL,
  stripe_price_id TEXT UNIQUE NOT NULL,

  -- Plan details
  name TEXT NOT NULL,
  description TEXT,
  tier TEXT NOT NULL, -- 'free', 'starter', 'pro', 'enterprise'

  -- Pricing
  price_cents INT NOT NULL,
  currency TEXT DEFAULT 'usd',
  billing_interval TEXT NOT NULL, -- 'month', 'year'

  -- Features
  features JSONB DEFAULT '[]'::jsonb,

  -- Limits (matches rate_limit_tiers)
  requests_per_minute INT NOT NULL,
  requests_per_hour INT NOT NULL,
  requests_per_day INT NOT NULL,
  max_members INT, -- NULL = unlimited
  max_api_keys INT, -- NULL = unlimited
  max_webhooks INT, -- NULL = unlimited
  storage_gb INT, -- NULL = unlimited

  -- Trial
  trial_days INT DEFAULT 0,

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization subscriptions
CREATE TABLE IF NOT EXISTS organization_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id) ON DELETE SET NULL,

  -- Stripe integration
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT NOT NULL,

  -- Subscription details
  status TEXT NOT NULL, -- 'active', 'trialing', 'past_due', 'canceled', 'unpaid'
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,

  -- Billing
  billing_email TEXT,
  payment_method_last4 TEXT,
  payment_method_brand TEXT, -- 'visa', 'mastercard', etc.

  -- Metadata
  metadata JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(organization_id)
);

-- Invoices (synced from Stripe)
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES organization_subscriptions(id) ON DELETE SET NULL,

  -- Stripe integration
  stripe_invoice_id TEXT UNIQUE NOT NULL,

  -- Invoice details
  invoice_number TEXT,
  amount_cents INT NOT NULL,
  amount_paid_cents INT DEFAULT 0,
  currency TEXT DEFAULT 'usd',

  -- Status
  status TEXT NOT NULL, -- 'draft', 'open', 'paid', 'void', 'uncollectible'
  paid BOOLEAN DEFAULT false,

  -- Dates
  invoice_date TIMESTAMPTZ NOT NULL,
  due_date TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,

  -- Links
  invoice_pdf TEXT, -- URL to PDF
  hosted_invoice_url TEXT, -- Stripe hosted page

  -- Metadata
  description TEXT,
  metadata JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment methods
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Stripe integration
  stripe_payment_method_id TEXT UNIQUE NOT NULL,

  -- Card details (stored securely by Stripe, we only keep metadata)
  type TEXT NOT NULL, -- 'card', 'bank_account', etc.
  card_brand TEXT, -- 'visa', 'mastercard', etc.
  card_last4 TEXT,
  card_exp_month INT,
  card_exp_year INT,

  -- Status
  is_default BOOLEAN DEFAULT false,

  -- Billing details
  billing_name TEXT,
  billing_email TEXT,
  billing_address JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Billing events log (Stripe webhook events)
CREATE TABLE IF NOT EXISTS billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,

  -- Stripe event
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,

  -- Event data
  data JSONB NOT NULL,

  -- Processing
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage-based billing tracking
CREATE TABLE IF NOT EXISTS usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES organization_subscriptions(id) ON DELETE SET NULL,

  -- Usage tracking
  metric_type TEXT NOT NULL, -- 'api_requests', 'storage', 'seats', etc.
  quantity INT NOT NULL,

  -- Billing period
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,

  -- Stripe reporting
  reported_to_stripe BOOLEAN DEFAULT false,
  stripe_usage_record_id TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_subscription_plans_tier ON subscription_plans(tier, is_active);
CREATE INDEX idx_subscription_plans_stripe ON subscription_plans(stripe_product_id, stripe_price_id);
CREATE INDEX idx_org_subscriptions_org ON organization_subscriptions(organization_id);
CREATE INDEX idx_org_subscriptions_status ON organization_subscriptions(status, current_period_end);
CREATE INDEX idx_invoices_org_date ON invoices(organization_id, invoice_date DESC);
CREATE INDEX idx_invoices_status ON invoices(status, due_date);
CREATE INDEX idx_payment_methods_org ON payment_methods(organization_id, is_default DESC);
CREATE INDEX idx_billing_events_processed ON billing_events(processed, created_at DESC);
CREATE INDEX idx_usage_records_org_period ON usage_records(organization_id, period_start DESC);

-- RLS Policies
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;

-- Anyone can view active plans (public pricing page)
CREATE POLICY "Anyone can view active plans"
  ON subscription_plans FOR SELECT
  USING (is_active = true);

-- Organization admins can view their subscription
CREATE POLICY "Organization admins can view subscription"
  ON organization_subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = organization_subscriptions.organization_id
        AND organization_members.user_id = auth.uid()
        AND organization_members.role IN ('owner', 'admin')
    )
  );

-- Organization admins can view their invoices
CREATE POLICY "Organization admins can view invoices"
  ON invoices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = invoices.organization_id
        AND organization_members.user_id = auth.uid()
        AND organization_members.role IN ('owner', 'admin')
    )
  );

-- Organization admins can view their payment methods
CREATE POLICY "Organization admins can view payment methods"
  ON payment_methods FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = payment_methods.organization_id
        AND organization_members.user_id = auth.uid()
        AND organization_members.role IN ('owner', 'admin')
    )
  );

-- Organization admins can view usage records
CREATE POLICY "Organization admins can view usage"
  ON usage_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = usage_records.organization_id
        AND organization_members.user_id = auth.uid()
        AND organization_members.role IN ('owner', 'admin')
    )
  );

-- Function to sync subscription tier with rate limits
CREATE OR REPLACE FUNCTION sync_subscription_to_rate_limits()
RETURNS TRIGGER AS $$
BEGIN
  -- When subscription changes to active, update rate limits
  IF NEW.status = 'active' AND NEW.plan_id IS NOT NULL THEN
    UPDATE rate_limit_configs
    SET
      tier = (SELECT tier FROM subscription_plans WHERE id = NEW.plan_id),
      requests_per_minute = (SELECT requests_per_minute FROM subscription_plans WHERE id = NEW.plan_id),
      requests_per_hour = (SELECT requests_per_hour FROM subscription_plans WHERE id = NEW.plan_id),
      requests_per_day = (SELECT requests_per_day FROM subscription_plans WHERE id = NEW.plan_id),
      updated_at = NOW()
    WHERE organization_id = NEW.organization_id;
  END IF;

  -- When subscription is canceled/unpaid, downgrade to free
  IF NEW.status IN ('canceled', 'unpaid') AND (OLD.status IS NULL OR OLD.status NOT IN ('canceled', 'unpaid')) THEN
    UPDATE rate_limit_configs
    SET
      tier = 'free',
      requests_per_minute = (SELECT requests_per_minute FROM rate_limit_tiers WHERE tier_name = 'free'),
      requests_per_hour = (SELECT requests_per_hour FROM rate_limit_tiers WHERE tier_name = 'free'),
      requests_per_day = (SELECT requests_per_day FROM rate_limit_tiers WHERE tier_name = 'free'),
      updated_at = NOW()
    WHERE organization_id = NEW.organization_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to sync subscription changes to rate limits
CREATE TRIGGER sync_subscription_rate_limits
  AFTER INSERT OR UPDATE ON organization_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION sync_subscription_to_rate_limits();

-- Trigger for updated_at
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_org_subscriptions_updated_at
  BEFORE UPDATE ON organization_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE subscription_plans IS 'Available subscription plans with pricing and features';
COMMENT ON TABLE organization_subscriptions IS 'Active subscriptions per organization';
COMMENT ON TABLE invoices IS 'Invoice history synced from Stripe';
COMMENT ON TABLE payment_methods IS 'Saved payment methods for organizations';
COMMENT ON TABLE billing_events IS 'Stripe webhook events log for auditing';
COMMENT ON TABLE usage_records IS 'Usage-based billing metrics';
