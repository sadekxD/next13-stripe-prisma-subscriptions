"use client";

import { useState } from "react";
import {
  Price,
  ProductWithPrice,
  Subscription,
  SubscriptionWithPrice,
} from "types/types";
import { getStripe } from "@/lib/stripe-client";
import { postData } from "@/lib/helpers";
import Button from "./Button";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import cn from "classnames";

interface Props {
  products: ProductWithPrice[];
  subscription: SubscriptionWithPrice;
}

type BillingInterval = "year" | "month";

export default function Pricing({ products, subscription }: Props) {
  const router = useRouter();
  const [billingInterval, setBillingInterval] =
    useState<BillingInterval>("month");
  const [priceIdLoading, setPriceIdLoading] = useState<string>();
  const { data: session } = useSession();

  const handleCheckout = async (price: Price) => {
    setPriceIdLoading(price.id);
    if (!session?.user) {
      return router.push("/login");
    }
    if (subscription) {
      return router.push("/account");
    }

    try {
      const { sessionId } = await postData({
        url: "/api/create-checkout-session",
        data: { price },
      });

      const stripe = await getStripe();
      stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      return alert((error as Error)?.message);
    } finally {
      setPriceIdLoading(undefined);
    }
  };

  if (!products.length)
    return (
      <section>
        <div className="max-w-6xl mx-auto py-8 sm:py-24 px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:flex-col sm:align-center"></div>
          <p className="text-6xl font-extrabold sm:text-center sm:text-6xl">
            No subscription pricing plans found. Create them in your{" "}
            <a
              className="text-pink-500 underline"
              href="https://dashboard.stripe.com/products"
              rel="noopener noreferrer"
              target="_blank"
            >
              Stripe Dashboard
            </a>
            .
          </p>
        </div>
      </section>
    );

  console.log(subscription);

  return (
    <section>
      <div className="max-w-6xl mx-auto py-8 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:flex-col sm:align-center">
          <h1 className="text-4xl font-extrabold  sm:text-center sm:text-6xl">
            Pricing Plans
          </h1>
          <p className="mt-5 text-xl sm:text-center sm:text-2xl max-w-2xl m-auto">
            Start building for free, then add a site plan to go live. Account
            plans unlock additional features.
          </p>
          <div className="relative self-center mt-6 rounded-lg p-0.5 flex sm:mt-8 border border-zinc-800">
            <button
              onClick={() => setBillingInterval("month")}
              type="button"
              className={`${
                billingInterval === "month"
                  ? "relative w-1/2 bg-zinc-700 text-white border-zinc-800 shadow-sm "
                  : "ml-0.5 relative w-1/2 border border-transparent"
              } rounded-md m-1 py-2 text-sm font-medium whitespace-nowrap focus:outline-nonefocus:z-10 sm:w-auto sm:px-8`}
            >
              Monthly billing
            </button>
            <button
              onClick={() => setBillingInterval("year")}
              type="button"
              className={`${
                billingInterval === "year"
                  ? "relative w-1/2 bg-zinc-700 text-white border-zinc-800 shadow-sm "
                  : "ml-0.5 relative w-1/2 border border-transparent"
              } rounded-md m-1 py-2 text-sm font-medium whitespace-nowrap focus:outline-none focus:z-10 sm:w-auto sm:px-8`}
            >
              Yearly billing
            </button>
          </div>
        </div>
        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-4">
          {products.map((product) => {
            const price = product?.prices?.find(
              (price) => price.interval === billingInterval
            );
            if (!price) return null;
            const priceString = new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: price.currency,
              minimumFractionDigits: 0,
            }).format((price?.unitAmount || 0) / 100);
            return (
              <div
                key={product.id}
                className={cn("rounded-lg shadow-lg divide-y divide-zinc-600", {
                  "border border-pink-500": subscription
                    ? product.name === subscription?.price?.product?.name
                    : product.name === "Freelancer",
                })}
              >
                <div className="p-6">
                  <h2 className="text-2xl leading-6 font-semibold ">
                    {product.name}
                  </h2>
                  <p className="mt-4">{product.description}</p>
                  <p className="mt-8">
                    <span className="text-5xl font-extrabold white">
                      {priceString}
                    </span>
                    <span className="text-base font-medium">
                      /{billingInterval}
                    </span>
                  </p>
                  <Button
                    variant="slim"
                    type="button"
                    loading={priceIdLoading === price.id}
                    onClick={() => handleCheckout(price)}
                    className="mt-8 block w-full border-2! rounded-md py-2 text-sm font-semibold  text-center hover:bg-zinc-900"
                  >
                    {product.id === subscription?.price?.productId
                      ? "Manage"
                      : "Subscribe"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
