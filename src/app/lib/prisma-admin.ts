import { prisma } from "./prisma";
import { stripe } from "./stripe";

const createOrRetrieveCustomer = async ({
  id,
  email,
}: {
  id: string;
  email: string;
}) => {
  let user;
  user = await prisma.customer.findUnique({
    where: {
      id: id,
    },
  });

  if (!user) {
    const customerData = { id: id, email: email };
    const customer = await stripe.customers.create(customerData);
    user = await prisma.customer.create({
      data: {
        id: id,
        email: email,
        stripeCustomerId: customer.id,
      } as any,
    });
  }

  return user.stripeCustomerId;
};

export { createOrRetrieveCustomer };
