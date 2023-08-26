import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import type { JWT } from "next-auth/jwt"
import type { User, Account, Profile, Session, NextAuthOptions } from "next-auth"
import type { AdapterUser } from "next-auth/adapters"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prisma from '@/utils/prisma'

interface jwtCallbackParams {
  token: JWT;
  user?: User | AdapterUser;
  account: Account | null;
  profile?: Profile;
  trigger?: "signIn" | "signUp" | "update";
  session?: any;
}

interface sessionCallbackParams {
  session: Session;
  user: User | AdapterUser;
  token: JWT;
}

const GOOGLE_AUTHORIZATION_URL: string =
  "https://accounts.google.com/o/oauth2/v2/auth?" +
  new URLSearchParams({
    prompt: "consent",
    access_type: "offline",
    response_type: "code",
  });

/**
 * Takes a token, and returns a new token with updated
 * `accessToken` and `accessTokenExpires`. If an error occurs,
 * returns the old token and an error property
 */
async function refreshAccessToken(token: JWT) {
  if (token.refreshToken === undefined) {
    console.error("called refreshAccessToken without a refreshToken");
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
  try {
    const url: string =
      "https://oauth2.googleapis.com/token?" +
      new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      });

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    // console.
    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: refreshedTokens.expires_at,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
    }
  } catch (error) {
    console.log("Refresh Token Error:", error)

    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

// TODO: https://next-auth.js.org/tutorials/refresh-token-rotation
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: GOOGLE_AUTHORIZATION_URL,
      httpOptions: {
        timeout: 60000,
      },
      idToken: true,
      allowDangerousEmailAccountLinking: true, // Note: don't do this for Discord
    }),
    // ...add more providers here
  ],
  callbacks: {
    async jwt({ token, user, account, profile, trigger, session }: jwtCallbackParams) {
      if (user && account && profile) {
        // Initial sign in
        // when trigger is "signIn" or "signUp", token contains a subset of JWT.
        // `name`, `email` and `picture` will be included.
        token.accessToken = account.access_token;
        token.provider = account.provider;
        token.type = account.type;
        token.emailVerified = profile.email_verified ?? false;
        token.version = 0; // TODO: hardcoded
        
        if (account.provider === 'google') {
          // profile changes depending on which account you use to log in
          token.givenName = profile.given_name;
          token.familyName = profile.family_name;
          token.locale = profile.locale;
          token.currentEmail = profile.email;
          token.accessTokenExpires = account.expires_at;
          token.refreshToken = account.refresh_token;
        }


        // Save permission info in JWT
        const permissions = await prisma.permission.findMany({
          where: { userId: token.sub },
          select: {
            collection: {
              select: {
                cid: true,
                id: true,
              }
            },
            accessLevel: true,
          },
        });
        token.collectionPerms = permissions.map(permission => ({
          colId: permission.collection.id,
          cid: permission.collection.cid,
          isAdmin: permission.accessLevel === "Admin",
        }));

        token.authors = await prisma.author.findMany({
          where: { userId: token.sub },
          select: {
            id: true,
            collectionId: true,
          }
        });

        return token;
      }

      if (trigger === "update") {
        // In this case, token contains the full JWT
        // session contains the data passed to update()
        // session should be validated. it could contain arbitrary data
        if (session?.updateAuthors) {
          token.authors = await prisma.author.findMany({
            where: { userId: token.sub },
            select: {
              id: true,
              collectionId: true,
            }
          });
        }
      }

      // TODO: this prevents the saved token from being updated
      // Return previous token if the access token has not expired yet
      if (token.provider === 'google') {
        if (token.accessTokenExpires) {
          // convert from milliseconds to seconds, add 10 second buffer
          if (Date.now() / 1000 + 10 < token.accessTokenExpires) {
            return token;
          }
        }
      }

      // Access token has expired, try to update it
      return refreshAccessToken(token);
    },
    async session({ session, token }: sessionCallbackParams) {
      // Send properties to the client, like an access_token and user id from a provider.
      session.accessToken = token.accessToken;
      session.currentEmail = token.currentEmail;
      session.emailVerified = token.emailVerified;
      session.fullName = token.name;
      session.givenName = token.givenName;
      session.familyName = token.familyName;
      session.locale = token.locale;
      session.userId = token.sub;
      session.collectionPerms = token.collectionPerms;
      session.authors = token.authors;
      return session;
    },
  },

  session: {
    strategy: "jwt" as const,
  },
  theme: {
    colorScheme: "auto" as const,
  },
};

export default NextAuth(authOptions);