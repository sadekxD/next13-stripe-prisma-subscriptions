import { getServerSession } from "next-auth";
import { options } from "../auth/[...nextauth]/options";
import { createOrRetrieveCustomer } from "@/app/lib/prisma-admin";
import { stripe } from "@/app/lib/stripe";
import { getURL } from "next/dist/shared/lib/utils";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { price, quantity = 1, metadata = {} } = body;
  const session = await getServerSession(options);

  if (!session) {
    return new Response(JSON.stringify({ message: "you must be logged in." }), {
      status: 401,
    });
  }

  try {
    const user = session?.user as any;

    const customer = await createOrRetrieveCustomer({
      id: user?.id || "",
      email: user?.email || "",
    });

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      billing_address_collection: "required",
      customer,
      line_items: [
        {
          price: price.id,
          quantity,
        },
      ],
      mode: "subscription",
      allow_promotion_codes: true,
      subscription_data: {
        // trial_from_plan: true,
        metadata,
      },
      success_url: `${getURL()}/account`,
      cancel_url: `${getURL()}/`,
    });

    return NextResponse.json({ sessionId: stripeSession.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
