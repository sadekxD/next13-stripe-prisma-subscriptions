import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(options);
  const user: any = session?.user;

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

    return NextResponse.json(result, { status: 200 });
  } else {
    return NextResponse.json({ message: "Not found!" }, { status: 404 });
  }
}
