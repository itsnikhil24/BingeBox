import { Request, Response, NextFunction } from "express";
import { supabase } from "../config/supabase";
import { ACCESS_COOKIE } from "../config/cookies";

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Browsers send the httpOnly cookie; the Bearer header stays supported
    // for non-browser API clients (e.g. Postman).
    const authHeader = req.headers.authorization;
    const token: string | undefined =
      req.cookies?.[ACCESS_COOKIE] ||
      (authHeader?.startsWith("Bearer ")
        ? authHeader.replace("Bearer ", "")
        : undefined);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    const { data: { user },error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};