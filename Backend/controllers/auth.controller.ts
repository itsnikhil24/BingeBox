import { Request, Response } from "express";
import { supabase } from "../config/supabase";
import {
    ACCESS_COOKIE,
    REFRESH_COOKIE,
    setAuthCookies,
    clearAuthCookies,
} from "../config/cookies";
import { getPublicUser, revokeSession } from "../services/auth.service";

export const signup = async (req: Request, res: Response) => {
    try {
        const { email, password, fullName, username } = req.body;

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        const { error: profileError } = await supabase
            .from("profiles")
            .insert({
                id: data.user!.id,
                full_name: fullName,
                username,
            });

        if (profileError) {
            return res.status(400).json({
                success: false,
                message: profileError.message,
            });
        }

        return res.status(201).json({
            success: true,
            user: data.user,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Signup failed",
        });
    }
};

// Login
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Authenticate the user
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return res.status(401).json({
                success: false,
                message: error.message,
            });
        }

        const user = await getPublicUser(data.user);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User profile not found",
            });
        }

        // Tokens go into httpOnly cookies only — never into the JSON body,
        // so frontend JS (and any injected script) can't read them.
        setAuthCookies(res, data.session);

        return res.status(200).json({
            success: true,
            user,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Login failed",
        });
    }
};

// Get current user (token already verified by authenticateUser)
export const me = async (req: Request, res: Response) => {
    try {
        const user = await getPublicUser(req.user!);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User profile not found",
            });
        }

        return res.status(200).json({
            success: true,
            user,
        });
    } catch (err) {
        console.error("ME ERROR:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to load user",
        });
    }
};

// Exchange the refresh-token cookie for a fresh session
export const refresh = async (req: Request, res: Response) => {
    try {
        const refreshToken: string | undefined = req.cookies?.[REFRESH_COOKIE];

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token required",
            });
        }

        const { data, error } = await supabase.auth.refreshSession({
            refresh_token: refreshToken,
        });

        if (error || !data.session) {
            clearAuthCookies(res);
            return res.status(401).json({
                success: false,
                message: "Session expired, please log in again",
            });
        }

        setAuthCookies(res, data.session);

        return res.status(200).json({
            success: true,
        });
    } catch (err) {
        console.error("REFRESH ERROR:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to refresh session",
        });
    }
};

// Logout — not behind authenticateUser so it still clears cookies when the
// access token has already expired.
export const logout = async (req: Request, res: Response) => {
    try {
        const accessToken: string | undefined = req.cookies?.[ACCESS_COOKIE];
        console.log(req.cookies);

        if (accessToken) {
            await revokeSession(accessToken);
        }
    } catch (err) {
        console.error("LOGOUT ERROR:", err);
    }

    clearAuthCookies(res);

    return res.status(200).json({
        success: true,
        message: "Logout successful",
    });
};
