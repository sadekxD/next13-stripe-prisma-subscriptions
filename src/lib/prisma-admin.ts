import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { Product, User } from "types/types";
import { Price } from "@prisma/client";
import { toDateTime } from "@/lib/helpers";

const getSubscription = async (user: User) => {
  let result;
  if (user) {
    result = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: {
          in: ["trialing", "active"],
        },
      },
      include: {
        price: {
          include: {
            product: true,
          },
        },
      },
    });

    return result;
  } else {
    return [];
  }
};

const createOrRetrieveCustomer = async ({
  id,
  email,
}: {
  id: string;
  email: string;
}) => {
  let user: any;
  let customer;

  user = await prisma.customer.findUnique({
    where: {
      id: id,
    },
  });

  console.log(user);

  if (!user) {
    const customerData = { metadata: { userId: id }, email: email };

    try {
      customer = await stripe.customers.create(customerData);

      user = await prisma.customer.create({
        data: {
          id: id,
          stripeCustomerId: customer.id,
        } as any,
      });
    } catch (err) {
      console.log(err);
    }
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
    await prisma.user.update({
      where: {
        id: uuid,
      },
      data: {
        billingAddress: { ...address },
        // @ts-ignore
        paymentMethod: { ...payment_method[payment_method.type] },
      },
    });
  } catch (error) {
    throw error;
  }
};

const manageSubscriptionStatusChange = async (
  subscriptionId: string,
  customerId: string,
  createAction = false
) => {
  let customer = await prisma.customer.findFirst({
    where: {
      stripeCustomerId: customerId,
    },
  });

  if (!customer) throw "No customer";

  const { id: uuid } = customer;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["default_payment_method"],
  });

  const subscriptionData = {
    id: subscription.id,
    userId: uuid,
    metadata: subscription.metadata,
    status: subscription.status,
    priceId: subscription.items.data[0].price.id,

    //TODO check quantity on subscription
    // @ts-ignore
    quantity: subscription.quantity,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    cancelAt: subscription.cancel_at
      ? toDateTime(subscription.cancel_at).toISOString()
      : null,
    cancelledAt: subscription.canceled_at
      ? toDateTime(subscription.canceled_at).toISOString()
      : null,
    currentPeriodStart: toDateTime(
      subscription.current_period_start
    ).toISOString(),
    currentPeriodEnd: toDateTime(subscription.current_period_end).toISOString(),
    createdAt: toDateTime(subscription.created).toISOString(),
    expiredAt: subscription.ended_at
      ? toDateTime(subscription.ended_at).toISOString()
      : null,
    trialStart: subscription.trial_start
      ? toDateTime(subscription.trial_start).toISOString()
      : null,
    trialEnd: subscription.trial_end
      ? toDateTime(subscription.trial_end).toISOString()
      : null,
    noteLimit: 3,
  };

  // @ts-ignore

  try {
    await prisma.subscription.upsert({
      where: { id: subscriptionData.id },
      update: {
        ...subscriptionData,
      } as any,
      create: {
        ...subscriptionData,
      } as any,
    });

    console.log(
      `Inserted/updated subscription [${subscription.id}] for user [${uuid}]`
    );

    // For a new subscription copy the billing details to the customer object.
    // NOTE: This is a costly operation and should happen at the very end.
    if (createAction && subscription.default_payment_method && uuid)
      //@ts-ignore
      await copyBillingDetailsToCustomer(
        uuid,
        subscription.default_payment_method as Stripe.PaymentMethod
      );
  } catch (error) {
    throw error;
  }
};

export {
  createOrRetrieveCustomer,
  upsertProductRecord,
  upsertPriceRecord,
  manageSubscriptionStatusChange,
  getSubscription,
};
