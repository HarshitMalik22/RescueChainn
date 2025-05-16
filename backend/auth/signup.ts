import express, { Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// POST /auth/signup
router.post('/signup', async (req: Request, res: Response) => {
    const { name, email, password, confirmPassword } = req.body;

    // Basic validation
    if (!name || !email || !password || !confirmPassword) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match.' });
    }

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name },
            },
        });

        if (error) {
            return res.status(400).json({ message: error.message });
        }

        res.status(201).json({ message: 'User registered successfully.', user: data.user });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

export default router;
