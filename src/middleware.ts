export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/customers/:path*",
    "/invoices/:path*",
    "/settings/:path*",
    "/api/customers/:path*",
    "/api/invoices/:path*",
    "/api/settings/:path*",
  ],
};
