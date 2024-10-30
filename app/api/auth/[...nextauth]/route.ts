/* eslint-disable @typescript-eslint/ban-ts-comment */
import NextAuth from "next-auth";
import { authOptions } from "./options";

const handler = NextAuth(authOptions);
// @ts-ignore
export { handler as GET, handler as POST };
