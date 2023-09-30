import Stripe from "stripe";

export interface PageMeta {
  title: string;
  description: string;
  cardImage: string;
}

export interface Customer {
  id: string;
  stripe_customer_id?: string;
}

export interface Product {
  id: string;
  active?: boolean;
  name?: string;
  description?: string;
  image?: string;
  metadata?: Stripe.Metadata;
}

export interface User {
  id?: string;
  name?: string;
  email?: string;
  image?: string;
}

export interface UserDetails {
  id: string /* primary key */;
  first_name: string;
  last_name: string;
  full_name?: string;
  avatar_url?: string;
  billing_address?: Stripe.Address;
  payment_method?: Stripe.PaymentMethod[Stripe.PaymentMethod.Type];
}

export interface Price {
  id: string /* primary key */;
  productId?: string /* foreign key to products.id */;
  active?: boolean;
  description?: string;
  unitAmount?: number;
  currency?: string;
  pricingType?: Stripe.Price.Type;
  interval?: Stripe.Price.Recurring.Interval;
  intervalCount?: number;
  trialPeriodDays?: number | null;
  metadata?: Stripe.Metadata;
  product?: Product;
}

export interface ProductWithPrice extends Product {
  prices?: Price[];
}

export interface PriceWithProduct extends Price {}

export interface Subscription {
  id: string /* primary key */;
  userId: string;
  status?: Stripe.Subscription.Status;
  priceId?: string /* foreign key to prices.id */;
  quantity?: number;
  cancelAtPeriodEnd?: Boolean;
  createdAt: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  expiredAt?: string;
  cancelAt?: string;
  canceled_at?: string;
  trialStart?: string;
  trialEnd?: string;
  metadata?: Stripe.Metadata;
  noteLimit?: number;
}

export interface SubscriptionWithPrice extends Subscription {
  price: Price;
}
