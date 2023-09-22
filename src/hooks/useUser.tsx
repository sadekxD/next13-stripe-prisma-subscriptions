import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

import { UserDetails, Subscription } from "types";

// type UserContextType = {
//   accessToken: string | null;
//   user: User | null;
//   userDetails: UserDetails | null;
//   isLoading: boolean;
//   subscription: Subscription | null;
// };
