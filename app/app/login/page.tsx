'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, AlertCircle, Chrome, ArrowLeft } from 'lucide-react'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error

            router.push('/')
            router.refresh()
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

    return (
        <div className="min-h-screen bg-[#0B0E11] flex flex-col items-center justify-center p-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Back Button */}
            <Link href="/" className="absolute top-6 left-6 text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
            </Link>

            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <div className="w-16 h-16 relative mx-auto mb-6 rounded-xl overflow-hidden shadow-2xl shadow-indigo-500/20">
                        <Image
                            src="/logo.jpg"
                            alt="DynoFX Logo"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Welcome back</h2>
                    <p className="mt-2 text-sm text-gray-400">
                        Enter your credentials to access your terminal
                    </p>
                </div>

                <div className="glass-panel p-8 rounded-2xl sm:px-10">
                    <div className="space-y-6">
                        <Button
                            size="lg"
                            variant="outline"
                            className="w-full gap-3 bg-white text-black hover:bg-gray-100 border-none font-semibold h-12"
                            onClick={handleGoogleLogin}
                        >
                            <Chrome className="w-5 h-5 text-blue-600" />
                            Sign in with Google
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-[#131619] px-4 text-gray-500 rounded-full">or email</span>
                            </div>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-sm p-4 rounded-lg flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">Email address</label>
                                    <Input
                                        type="email"
                                        placeholder="name@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="h-12"
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1.5 ml-1">
                                        <label className="block text-sm font-medium text-gray-300">Password</label>
                                        <a href="#" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">Forgot password?</a>
                                    </div>
                                    <Input
                                        type="password"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="h-12"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full text-base"
                                size="lg"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Authenticating...
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </Button>
                        </form>
                    </div>
                </div>

                <p className="text-center text-sm text-gray-400">
                    Don't have an account?{' '}
                    <Link href="/signup" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                        Create an account
                    </Link>
                </p>
            </div>
        </div>
    )
}
