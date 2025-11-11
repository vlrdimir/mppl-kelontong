import { type DefaultSession, type NextAuthConfig } from "next-auth";
import "next-auth/jwt";
import type { JWT } from "next-auth/jwt";
import Google from "next-auth/providers/google";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    tokenId: string;
    accessToken?: string;
    error?: string;
    user: {
      id: string;

      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    token: string;
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

declare module "next-auth/jwt" {
  interface JWT {
    idToken?: string;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    error?: "RefreshAccessTokenError";
  }
}

const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const REFRESH_MARGIN_MS = 60_000;

async function refreshGoogleAccessToken(token: JWT): Promise<JWT> {
  if (!token.refreshToken) {
    return { ...token, error: "RefreshAccessTokenError" } as JWT;
  }

  const clientId = process.env.AUTH_GOOGLE_ID;
  const clientSecret = process.env.AUTH_GOOGLE_SECRET;

  if (!clientId || !clientSecret) {
    console.error("Missing Google OAuth credentials for refresh token flow");
    return { ...token, error: "RefreshAccessTokenError" } as JWT;
  }

  try {
    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: token.refreshToken,
    });

    const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    const tokens = (await response.json()) as {
      access_token?: string;
      expires_in?: number;
      id_token?: string;
      refresh_token?: string;
      error?: string;
      error_description?: string;
    };

    if (!response.ok || !tokens.access_token || !tokens.expires_in) {
      throw new Error(
        tokens.error_description ??
          tokens.error ??
          "Failed to refresh access token"
      );
    }

    return {
      ...token,
      accessToken: tokens.access_token,
      idToken: tokens.id_token ?? token.idToken,
      refreshToken: tokens.refresh_token ?? token.refreshToken,
      expiresAt: Date.now() + tokens.expires_in * 1000,
      error: undefined,
    } as JWT;
  } catch (error) {
    console.error("Error refreshing Google access token", error);
    return { ...token, error: "RefreshAccessTokenError" } as JWT;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login", // Mengarahkan error ke halaman login
  },
  trustHost: true,
  providers: [
    Google({
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    signIn: async ({ user, account, profile, credentials, email }) => {
      console.log(user, "google provider");
      console.log(account, "account");
      console.log(profile, "profile");
      console.log(credentials, "credentials");
      console.log(email, "email");

      const signup = await fetch(`${process.env.HOSTNAME}/api/login`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          name: user.name,
        }),
      });

      if (signup.status !== 200) {
        return false;
      }

      await signup.json();
      return true;
    },
    jwt: async ({ token, account }) => {
      if (account) {
        token.idToken = account.id_token;
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token ?? token.refreshToken;
        token.expiresAt = account.expires_at
          ? account.expires_at * 1000
          : undefined;
      }

      if (
        !token.expiresAt ||
        Date.now() + REFRESH_MARGIN_MS < token.expiresAt
      ) {
        return token;
      }

      return refreshGoogleAccessToken(token);
    },
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;

      const protectedRoutes = ["/dashboard"];

      const isRestricted = protectedRoutes.some((route) =>
        request.nextUrl.pathname.includes(route)
      );

      if (isRestricted) {
        if (isLoggedIn) return true;

        return Response.redirect(new URL("/login", request.url));
      }

      // Redirect untuk halaman login jika sudah login (tapi bukan token expired)
      if (request.nextUrl.pathname === "/login" && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", request.nextUrl));
      }

      return true;
    },
    session: ({ session, token }) => {
      return {
        ...session,
        tokenId: token.idToken!,
        accessToken: token.accessToken,
        error: token.error,
        user: {
          ...session.user,
          id: token.sub!,
        },
      };
    },
  },
} satisfies NextAuthConfig;
