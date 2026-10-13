export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/customers/:path*",
    "/invoices/:path*",
    "/settings/:path*",
    "/users/:path*",
    "/profile/:path*",
    "/api/customers/:path*",
    "/api/invoices/:path*",
    "/api/settings/:path*",
    "/api/users/:path*",
    "/api/profile/:path*",
  ],
};
