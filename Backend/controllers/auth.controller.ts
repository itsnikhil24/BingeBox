import { Request, Response } from "express";
import { supabase } from "../config/supabase";

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

        // Fetch the user's profile
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("id, username, full_name")
            .eq("id", data.user.id)
            .single();

        if (profileError) {
            return res.status(404).json({
                success: false,
                message: "User profile not found",
            });
        }

        return res.status(200).json({
            success: true,
            session: data.session,
            user: {
                id: data.user.id,
                email: data.user.email,
                username: profile.username,
                fullName: profile.full_name,
            },
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Login failed",
        });
    }
};

// // Get current user
// export const me = async (req: Request, res: Response) => {
//     return res.json({
//         success: true,
//         user: req.user,
//     });
// };

// // Logout (client-side mainly)
// export const logout = async (req: Request, res: Response) => {
//     return res.json({
//         success: true,
//         message: "Logout successful",
//     });
// };