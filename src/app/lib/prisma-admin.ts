import Stripe from "stripe";
import { prisma } from "./prisma";
import { stripe } from "./stripe";
import { Product } from "types";
import { Price } from "@prisma/client";

const createOrRetrieveCustomer = async ({
  id,
  email,
}: {
  id: string;
  email: string;
}) => {
  let user;
  user = await prisma.customer.findUnique({
    where: {
      id: id,
    },
  });

  if (!user) {
    const customerData = { id: id, email: email };
    const customer = await stripe.customers.create(customerData);
    user = await prisma.customer.create({
      data: {
        id: id,
        email: email,
        stripeCustomerId: customer.id,
      } as any,
    });
  }

  return user.stripeCustomerId;
};

const upsertProductRecord = async (product: Stripe.Product) => {
  const productData: Product = {
    id: product.id,
    active: product.active,
    name: product.name || "",
    description: product.description ?? undefined,
    image: product.images?.[0] ?? null,
    metadata: product.metadata,
  };

  try {
    await prisma.product.upsert({
      where: { id: productData.id },
      create: productData,
      update: productData,
    });

    console.log(`Product inserted/updated: ${product.id}`);
  } catch (err) {
    console.log(err);
  }
};

const upsertPriceRecord = async (price: Stripe.Price) => {
  const priceData: Price = {
    id: price.id,
    productId: typeof price.product === "string" ? price.product : "",
    active: price.active,
    currency: price.currency,
    description: price.nickname ?? null,
    pricingType: price.type,
    unitAmount: price.unit_amount ?? 1,
    interval: price.recurring?.interval ?? "day",
    intervalCount: price.recurring?.interval_count ?? null,
    trialPeriodDays: price.recurring?.trial_period_days ?? null,
    metadata: price.metadata,
  };

  try {
    await prisma.price.upsert({
      where: { id: priceData.id },
      create: priceData as any,
      update: priceData as any,
    });

    console.log(`Price inserted/updated: ${price.id}`);
  } catch (err) {
    console.log(err);
  }
};

const manageSubscriptionStatusChange = async () => {};

const copyBillingDetailsToCustomer = async (
  uuid: string,
  payment_method: Stripe.PaymentMethod
) => {
  //Todo: check this assertion
  const customer = payment_method.customer as string;
  const { name, phone, address } = payment_method.billing_details;
  if (!name || !phone || !address) return;
  //@ts-ignore
  await stripe.customers.update(customer, { name, phone, address });

  try {
    await prisma.user.update({});
  } catch (error) {
    throw error;
  }
};

export {
  createOrRetrieveCustomer,
  upsertProductRecord,
  upsertPriceRecord,
  manageSubscriptionStatusChange,
};
