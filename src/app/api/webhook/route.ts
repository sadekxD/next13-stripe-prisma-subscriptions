import Cors from "micro-cors";
import Stripe from "stripe";
import { Readable } from "node:stream";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/app/lib/stripe";
import {
  manageSubscriptionStatusChange,
  upsertPriceRecord,
  upsertProductRecord,
} from "@/app/lib/prisma-admin";

const cors = Cors({
  allowMethods: ["POST", "HEAD"],
});

const relevantEvents = new Set([
  "product.created",
  "product.updated",
  "price.created",
  "price.updated",
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

export async function POST(req: Request) {
  if (req.method === "POST") {
    const buf = await req.text();
    const sig = headers().get("stripe-signature");
    const webhookSecret =
      process.env.STRIPE_WEBHOOK_SECRET_LIVE ??
      process.env.STRIPE_WEBHOOK_SECRET;
    let event: Stripe.Event;

    try {
      if (!sig || !webhookSecret) return;
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
      console.log(event);
    } catch (err: any) {
      console.log(`❌ Error message: ${err.message}`);
      return NextResponse.json(
        { message: `Webhook Error: ${err.message}` },
        { status: 500 }
      );
    }

    if (relevantEvents.has(event.type)) {
      try {
        switch (event.type) {
          case "product.created":
          case "product.updated":
            await upsertProductRecord(event.data.object as Stripe.Product);
            break;
          case "price.created":
          case "price.updated":
            await upsertPriceRecord(event.data.object as Stripe.Price);
            break;
          case "customer.subscription.created":
          case "customer.subscription.updated":
          case "customer.subscription.deleted":
            const subscription = event.data.object as Stripe.Subscription;
            await manageSubscriptionStatusChange(
              subscription.id,
              subscription.customer as string,
              event.type === "customer.subscription.created"
            );
            break;
          case "checkout.session.completed":
            const checkoutSession = event.data
              .object as Stripe.Checkout.Session;
            if (checkoutSession.mode === "subscription") {
              const subscriptionId = checkoutSession.subscription;
              await manageSubscriptionStatusChange(
                subscriptionId as string,
                checkoutSession.customer as string,
                true
              );
            }
            break;
          default:
            throw new Error("Unhandled relevant event!");
        }
      } catch (error) {
        console.error(error);
        return NextResponse.json(
          {
            message: "something went wrong",
            ok: false,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ received: true });
  } else {
    return NextResponse.json(
      { message: "Method Not Allowed" },
      { status: 405 }
    );
  }
}
