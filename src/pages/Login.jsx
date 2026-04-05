import { useState } from 'react';
import { LogIn, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!form.email || !form.password) {
            setError('Please fill in both email and password.');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: form.email,
                password: form.password,
            });
            
            if (error) throw error;
            
            setSuccess(true);
            setTimeout(() => navigate('/'), 1000);
            
        } catch (err) {
            console.error("Login Error:", err);
            
            // Helpful clear error messaging
            if (err.message === 'Invalid login credentials') {
                setError('Invalid email or password. Please try again.');
            } else if (err.message === 'Email not confirmed') {
                setError('Please confirm your email address before logging in. Check your inbox!');
            } else if (err.message) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred during login. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="max-w-md mx-auto px-6 py-16 flex flex-col items-center text-center">
                <div className="bg-green-500/10 border border-green-500/30 rounded-3xl p-10 shadow-lg animate-in fade-in zoom-in duration-300">
                    <CheckCircle size={56} className="text-green-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Login Successful!</h2>
                    <p className="text-white/60 mb-6">Welcome back to CampusConnect.</p>
                    <p className="text-sm text-green-400 font-medium animate-pulse">Redirecting to home...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto px-6 py-12">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 shadow-[0_8px_40px_rgba(139,92,246,0.15)] backdrop-blur-xl">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-purple-600/20 p-4 rounded-full mb-4">
                        <LogIn size={32} className="text-purple-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
                    <p className="text-white/60 mt-2 text-center">Log in to CampusConnect to continue.</p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
                        <span className="mt-0.5">⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-white/70 text-sm mb-1">Email Address</label>
                        <input required name="email" type="email" value={form.email} onChange={handleChange}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500 transition focus:bg-white/10" placeholder="john@example.com" />
                    </div>

                    <div>
                        <label className="block text-white/70 text-sm mb-1">Password</label>
                        <div className="relative">
                            <input required name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500 transition pr-12 focus:bg-white/10" placeholder="••••••••" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition p-1">
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" disabled={loading}
                        className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition mt-8 flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 active:scale-[0.98]">
                        {loading ? (
                            <>
                                <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                                Logging In...
                            </>
                        ) : 'Log In'}
                    </button>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-white/60">Don't have an account? </span>
                        <Link to="/register" className="text-purple-400 hover:text-purple-300 font-medium transition">
                            Register now
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
