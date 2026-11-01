import { CookieOptions, Response } from "express";
import { Session } from "@supabase/supabase-js";

export const ACCESS_COOKIE = "bb_access_token";
export const REFRESH_COOKIE = "bb_refresh_token";

const REFRESH_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

const sameSite = (process.env.COOKIE_SAME_SITE || "lax") as CookieOptions["sameSite"];

const baseOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production" || sameSite === "none",
  sameSite,
};

export const setAuthCookies = (res: Response, session: Session) => {
  res.cookie(ACCESS_COOKIE, session.access_token, {
    ...baseOptions,
    path: "/",
    maxAge: session.expires_in * 1000,
  });

  // Only the auth routes (refresh/logout) ever need the refresh token.
  res.cookie(REFRESH_COOKIE, session.refresh_token, {
    ...baseOptions,
    path: "/api/auth",
    maxAge: REFRESH_MAX_AGE_MS,
  });
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie(ACCESS_COOKIE, { ...baseOptions, path: "/" });
  res.clearCookie(REFRESH_COOKIE, { ...baseOptions, path: "/api/auth" });
};
