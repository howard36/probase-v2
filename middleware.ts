import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req) {
    const token = req.nextauth.token;
    let url = req.nextUrl.clone()
    const cid = url.pathname.split('/')[2];

    if (token?.collectionPerms.some(perm => perm.cid === cid)) {
      return NextResponse.next();
    } else {
      url.pathname = '/need-permission'
      return NextResponse.redirect(url);
    }
  }
)

export const config = { matcher: ["/d/:path*"] }
