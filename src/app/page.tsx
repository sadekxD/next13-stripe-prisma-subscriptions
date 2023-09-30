import Pricing from "@/app/components/Pricing";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { getSubscription } from "@/lib/prisma-admin";

export default async function Home() {
  const products = await prisma.product.findMany({ include: { prices: true } });
  const session = await getServerSession(options);
  const subscription = await getSubscription(session?.user as any);

  return (
    <main>
      <Pricing products={products as any} subscription={subscription as any} />
    </main>
  );
}
