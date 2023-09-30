import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { createOrRetrieveCustomer } from "@/lib/prisma-admin";
import { getURL } from "@/lib/helpers";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const session = await getServerSession(options);
    const user: any = session?.user;
    const customer = await createOrRetrieveCustomer({
      id: user.id || "",
      email: user.email || "",
    });

    if (!customer) throw Error("Could not get customer");
    const { url } = await stripe.billingPortal.sessions.create({
      customer,
      return_url: `${getURL()}/account`,
    });
    return NextResponse.json({ url }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 405 });
  }
}
