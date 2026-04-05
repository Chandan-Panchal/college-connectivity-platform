import { useState } from 'react';
import { UserPlus, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '', phone: '', email: '', branch: '', year: '', password: '', confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(null); // null, {type: 'direct', name}, {type: 'confirmation', email}

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (form.password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        setLoading(true);
        try {
            const { data, error: authError } = await supabase.auth.signUp({
                email: form.email,
                password: form.password,
                options: {
                    data: {
                        full_name: form.name,
                        branch: form.branch,
                        year: form.year,
                    }
                }
            });

            if (authError) throw authError;

            const user = data.user;

            if (data.session && user) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .upsert(
                        {
                            user_id: user.id,
                            branch: form.branch,
                            year: Number(form.year),
                            bio: null,
                            avatar_url: null
                        },
                        { onConflict: 'user_id' }
                    );

                if (profileError) throw profileError;
            }

            if (!data.session) {
                setSuccess({ type: 'confirmation', email: form.email });
            } else {
                setSuccess({ type: 'direct', name: form.name });
                setTimeout(() => navigate('/'), 2000);
            }
            
        } catch (err) {
            console.error("Registration Error:", err);
            
            // Handle specific Supabase Auth and DB errors
            if (err.message === 'User already registered') {
                setError('This email is already registered. Please log in instead.');
            } else if (err.message) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred during registration. Please try again.');
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
                    {success.type === 'confirmation' ? (
                        <>
                            <h2 className="text-2xl font-bold text-white mb-2">Check your email!</h2>
                            <p className="text-white/60 mb-6">We've sent a confirmation link to <span className="text-white font-medium">{success.email}</span>. Please confirm your email to continue.</p>
                            <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium transition">Proceed to Login</Link>
                        </>
                    ) : (
                        <>
                            <h2 className="text-2xl font-bold text-white mb-2">Registration Successful!</h2>
                            <p className="text-white/60 mb-6">Welcome to CampusConnect, <span className="text-white font-medium">{success.name}</span>!</p>
                            <p className="text-sm text-green-400 font-medium animate-pulse">Redirecting you to home...</p>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto px-6 py-12">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 shadow-[0_8px_40px_rgba(139,92,246,0.15)] backdrop-blur-xl">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-purple-600/20 p-4 rounded-full mb-4">
                        <UserPlus size={32} className="text-purple-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">Student Registration</h2>
                    <p className="text-white/60 mt-2 text-center">Join CampusConnect and unlock all features.</p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
                        <span className="mt-0.5">⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-white/70 text-sm mb-1">Full Name</label>
                        <input required name="name" type="text" value={form.name} onChange={handleChange}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500 transition focus:bg-white/10" placeholder="John Doe" />
                    </div>

                    <div>
                        <label className="block text-white/70 text-sm mb-1">Phone Number</label>
                        <input required name="phone" type="tel" value={form.phone} onChange={handleChange}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500 transition focus:bg-white/10" placeholder="+91 XXXXXXXXXX" />
                        <p className="text-white/35 text-xs mt-2">Phone is used during listings and is not stored in the base profile schema yet.</p>
                    </div>

                    <div>
                        <label className="block text-white/70 text-sm mb-1">Email Address</label>
                        <input required name="email" type="email" value={form.email} onChange={handleChange}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500 transition focus:bg-white/10" placeholder="john@example.com" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-white/70 text-sm mb-1">Branch / Major</label>
                            <input required name="branch" type="text" value={form.branch} onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500 transition focus:bg-white/10" placeholder="Computer Sci." />
                        </div>
                        <div>
                            <label className="block text-white/70 text-sm mb-1">Year of Study</label>
                            <select required name="year" value={form.year} onChange={handleChange}
                                className="w-full bg-[#1a1528] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500 transition appearance-none cursor-pointer">
                                <option value="" disabled>Select Year</option>
                                <option value="1">1st Year</option>
                                <option value="2">2nd Year</option>
                                <option value="3">3rd Year</option>
                                <option value="4">4th Year</option>
                                <option value="5">5th Year+</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-white/70 text-sm mb-1">Password</label>
                        <div className="relative">
                            <input required name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500 transition pr-12 focus:bg-white/10" placeholder="Min. 6 characters" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition p-1">
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-white/70 text-sm mb-1">Confirm Password</label>
                        <input required name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500 transition focus:bg-white/10" placeholder="Re-enter password" />
                    </div>

                    <button type="submit" disabled={loading}
                        className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition mt-6 flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 active:scale-[0.98]">
                        {loading ? (
                            <>
                                <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                                Creating Account...
                            </>
                        ) : 'Create Account'}
                    </button>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-white/60">Already have an account? </span>
                        <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium transition">
                            Log In
                        </Link>
                    </div>

                    <p className="text-white/40 text-xs text-center mt-6">
                        By registering, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </form>
            </div>
        </div>
    );
}
