export { default } from "next-auth/middleware";

// Applies next auth only to matching routes - can be regex
// Ref: https://nextjs.org/docs/app/building-your-application/routing/middleware

export const config = { matcher: ["/account"] };
