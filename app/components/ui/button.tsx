import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass'
    size?: 'sm' | 'md' | 'lg'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
        const variants = {
            primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20 active:translate-y-0.5",
            secondary: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20",
            outline: "bg-transparent border border-white/20 hover:bg-white/5 text-white hover:border-white/30",
            ghost: "bg-transparent hover:bg-white/5 text-gray-300 hover:text-white",
            glass: "bg-white/5 hover:bg-white/10 border border-white/10 text-white backdrop-blur-sm"
        }

        const sizes = {
            sm: "h-9 px-4 text-xs font-semibold uppercase tracking-wide",
            md: "h-11 px-6 text-sm font-medium",
            lg: "h-14 px-8 text-base font-semibold"
        }

        return (
            <button
                className={cn(
                    "inline-flex items-center justify-center rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed select-none",
                    variants[variant],
                    sizes[size],
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
