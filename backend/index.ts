import express, { Request, Response } from 'express';
import cors from 'cors';
import { supabase } from './supabaseClient';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Route for Signup
app.post('/signup', async (req: Request, res: Response) => {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
        return res.status(400).json({ error: 'Email, password, and name are required' });
    }
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name }
            }
        });
        
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        
        return res.status(200).json({ message: 'Signup Successful', user: data.user });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Route for Login
app.post('/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });    
    }
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        
        return res.status(200).json({ message: 'Login Successful', user: data.user });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});