import { auth } from "@/lib/auth/server";
export default auth.middleware({loginUrl:"/auth/sign-in"});
export const config={matcher:["/dashboard/:path*","/editor/:path*","/projects/:path*","/account/:path*","/onboarding/:path*","/api/projects/:path*","/api/upload/:path*","/api/media/:path*","/api/export/:path*"]};
