"use client";

import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Button,
} from "@material-tailwind/react";
import { useState, useEffect } from "react";
import { Price, ProductWithPrice } from "types";
import CheckIcon from "./CheckIcons";
import { getStripe } from "../lib/stripe-client";
import { postData } from "../lib/helpers";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

interface Props {
  products: ProductWithPrice;
}

type BillingInterval = "year" | "month";

export default function Pricing({ products }: Props) {
  const [billigInterval, setBillingInterval] =
    useState<BillingInterval>("month");
  const [priceIdLoading, setPriceIdLoading] = useState<string>();

  const { data: session } = useSession();
  const user = session?.user;
  console.log(session);

  const handleCheckout = async (price: Price) => {
    setPriceIdLoading(price.id);
    // if (!user) {
    //   redirect("/signin");
    // }
    // if (subscription) {
    //   redirect("/account");
    // }

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

  return (
    <Card
      color="deep-purple"
      variant="gradient"
      className="w-full max-w-[20rem] p-8"
    >
      <CardHeader
        floated={false}
        shadow={false}
        color="transparent"
        className="m-0 mb-8 rounded-none border-b border-white/10 pb-8 text-center"
      >
        <Typography
          variant="small"
          color="white"
          className="font-normal uppercase"
        >
          standard
        </Typography>
        <Typography
          variant="h1"
          color="white"
          className="mt-6 flex justify-center gap-1 text-7xl font-normal"
        >
          <span className="mt-2 text-4xl">$</span>29{" "}
          <span className="self-end text-4xl">/mo</span>
        </Typography>
      </CardHeader>
      <CardBody className="p-0">
        <ul className="flex flex-col gap-4">
          <li className="flex items-center gap-4">
            <span className="rounded-full border border-white/20 bg-white/20 p-1">
              <CheckIcon />
            </span>
            <Typography className="font-normal">5 team members</Typography>
          </li>
          <li className="flex items-center gap-4">
            <span className="rounded-full border border-white/20 bg-white/20 p-1">
              <CheckIcon />
            </span>
            <Typography className="font-normal">200+ components</Typography>
          </li>
          <li className="flex items-center gap-4">
            <span className="rounded-full border border-white/20 bg-white/20 p-1">
              <CheckIcon />
            </span>
            <Typography className="font-normal">40+ built-in pages</Typography>
          </li>
          <li className="flex items-center gap-4">
            <span className="rounded-full border border-white/20 bg-white/20 p-1">
              <CheckIcon />
            </span>
            <Typography className="font-normal">1 year free updates</Typography>
          </li>
          <li className="flex items-center gap-4">
            <span className="rounded-full border border-white/20 bg-white/20 p-1">
              <CheckIcon />
            </span>
            <Typography className="font-normal">
              Life time technical support
            </Typography>
          </li>
        </ul>
      </CardBody>
      <CardFooter className="mt-12 p-0">
        <Button
          size="lg"
          color="white"
          className="hover:scale-[1.02] focus:scale-[1.02] active:scale-100"
          ripple={false}
          fullWidth={true}
        >
          Buy Now
        </Button>
      </CardFooter>
    </Card>
  );
}
