'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, AlertCircle, CheckCircle, Chrome, ArrowLeft, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SignupPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    // Password Validation State
    const [passwordFocused, setPasswordFocused] = useState(false)
    const passwordRules = {
        length: password.length >= 12,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    }
    const isPasswordValid = Object.values(passwordRules).every(Boolean)

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isPasswordValid) return

        setLoading(true)
        setError(null)

        try {
            const { error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { username },
                    emailRedirectTo: `${location.origin}/auth/callback`,
                },
            })
            if (signUpError) throw signUpError
            setSuccess(true)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${location.origin}/auth/callback`,
                },
            })
            if (error) throw error
        } catch (err: any) {
            setError(err.message)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen bg-[#0B0E11] flex items-center justify-center p-4">
                <div className="glass-panel w-full max-w-md p-8 rounded-2xl text-center">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Check your inbox</h2>
                    <p className="text-gray-400 mb-8 leading-relaxed">
                        We've sent a verification link to <span className="text-white font-medium">{email}</span>.
                        Please confirm your email to activate your account.
                    </p>
                    <Link href="/login">
                        <Button variant="outline" className="w-full">Back to Login</Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0B0E11] flex flex-col items-center justify-center p-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <Link href="/" className="absolute top-6 left-6 text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
            </Link>

            <div className="w-full max-w-md space-y-8 my-8">
                <div className="text-center">
                    <div className="w-16 h-16 relative mx-auto mb-6 rounded-xl overflow-hidden shadow-2xl shadow-indigo-500/20">
                        <Image src="/logo.jpg" alt="DynoFX Logo" fill className="object-cover" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Create an account</h2>
                    <p className="mt-2 text-sm text-gray-400">Join thousands of traders improving their skills</p>
                </div>

                <div className="glass-panel p-8 rounded-2xl sm:px-10">
                    <Button
                        size="lg"
                        variant="outline"
                        className="w-full gap-3 bg-white text-black hover:bg-gray-100 border-none font-semibold h-12 mb-6"
                        onClick={handleGoogleLogin}
                    >
                        <Chrome className="w-5 h-5 text-blue-600" />
                        Sign up with Google
                    </Button>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
                        <div className="relative flex justify-center text-sm"><span className="bg-[#131619] px-4 text-gray-500 rounded-full">or continue with email</span></div>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-5">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-sm p-4 rounded-lg flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="grid gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">Username</label>
                                <Input type="text" placeholder="trader123" value={username} onChange={(e) => setUsername(e.target.value)} required minLength={3} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">Email</label>
                                <Input type="email" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">Password</label>
                                <Input
                                    type="password"
                                    placeholder="Create a strong password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setPasswordFocused(true)}
                                    required
                                />

                                {/* Visual Password Strength Indicator */}
                                <div className={cn("overflow-hidden transition-all duration-300 ease-in-out", passwordFocused ? "max-h-64 mt-4 opacity-100" : "max-h-0 opacity-0")}>
                                    <div className="bg-white/5 rounded-lg p-3 border border-white/5 space-y-2">
                                        <ProgressBar validCount={Object.values(passwordRules).filter(Boolean).length} total={5} />
                                        <div className="space-y-1 pt-2">
                                            <PasswordRequirement fulfilled={passwordRules.length} label="12+ characters" />
                                            <PasswordRequirement fulfilled={passwordRules.uppercase} label="Uppercase letter" />
                                            <PasswordRequirement fulfilled={passwordRules.lowercase} label="Lowercase letter" />
                                            <PasswordRequirement fulfilled={passwordRules.number} label="Number" />
                                            <PasswordRequirement fulfilled={passwordRules.special} label="Special character" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button type="submit" className="w-full text-base mt-2" size="lg" disabled={loading || !isPasswordValid}>
                            {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Creating Account...</> : 'Create Account'}
                        </Button>
                    </form>
                </div>

                <p className="text-center text-sm text-gray-400">
                    Already have an account?{' '}
                    <Link href="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    )
}

function PasswordRequirement({ fulfilled, label }: { fulfilled: boolean, label: string }) {
    return (
        <div className={cn("flex items-center gap-2 text-xs transition-colors duration-200", fulfilled ? "text-emerald-400" : "text-gray-500")}>
            <div className={cn("w-4 h-4 rounded-full flex items-center justify-center border", fulfilled ? "bg-emerald-500/20 border-emerald-500/50" : "border-gray-700 bg-transparent")}>
                {fulfilled && <Check className="w-2.5 h-2.5" />}
            </div>
            {label}
        </div>
    )
}

function ProgressBar({ validCount, total }: { validCount: number, total: number }) {
    const percentage = (validCount / total) * 100
    let color = "bg-red-500"
    if (validCount >= 3) color = "bg-yellow-500"
    if (validCount === 5) color = "bg-emerald-500"

    return (
        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden mb-2">
            <div className={cn("h-full transition-all duration-500", color)} style={{ width: `${percentage}%` }} />
        </div>
    )
}
