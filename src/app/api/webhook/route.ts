import { NextResponse, NextRequest } from "next/server";
import { stripe } from "@/app/lib/stripe";

export async function POST(req: NextRequest) {
  return new Response("Hello, Next.js!");
}
