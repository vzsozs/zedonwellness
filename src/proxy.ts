import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // /admin is a separate, non-localized section (its own auth-gated layout).
  matcher: ["/((?!api|admin|_next|_vercel|.*\\..*).*)"],
};
