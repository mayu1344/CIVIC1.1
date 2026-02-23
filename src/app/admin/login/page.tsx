"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { MapPin, Eye, EyeOff, Shield, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { authService } from "@/lib/services/auth.service";
import toast from "react-hot-toast";

const schema = z.object({
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

export default function AdminLoginPage() {
    const router = useRouter();
    const [showPass, setShowPass] = useState(false);
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: FormData) => {
        try {
            await authService.login({
                email: data.email,
                password: data.password
            });
            toast.success("Welcome back, Admin!");
            router.push("/admin/dashboard");
        } catch (error: any) {
            console.error("Login failed:", error);
            const message = error.response?.data?.message || "Invalid credentials. (Demo: admin@civic.gov / admin123)";
            toast.error(message);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background Shapes */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/5 rounded-full" />
                <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-white/5 rounded-full" />
                <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-white/3 rounded-full -translate-y-1/2" />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2.5 bg-white/10 px-5 py-3 rounded-2xl border border-white/15 backdrop-blur-sm mb-5">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-left">
                            <p className="text-white font-bold text-lg leading-none">CivicPath</p>
                            <p className="text-blue-200 text-xs">Admin Console</p>
                        </div>
                    </div>
                    <h1 className="text-2xl font-black text-white">Welcome Back</h1>
                    <p className="text-blue-200 text-sm mt-1">Sign in to access the Admin Console</p>
                </div>

                {/* Form Card */}
                <div className="glass rounded-3xl p-8 shadow-card-xl">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="label-field">Email Address</label>
                            <input
                                {...register("email")}
                                type="email"
                                placeholder="admin@civic.gov"
                                className={cn("input-field", errors.email && "input-field-error")}
                            />
                            {errors.email && <p className="error-text">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="label-field">Password</label>
                            <div className="relative">
                                <input
                                    {...register("password")}
                                    type={showPass ? "text" : "password"}
                                    placeholder="••••••••"
                                    className={cn("input-field pr-11", errors.password && "input-field-error")}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="error-text">{errors.password.message}</p>}
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="rounded border-gray-300 text-civic-blue" />
                                <span className="text-sm text-gray-600">Remember me</span>
                            </label>
                            <button type="button" className="text-sm text-civic-blue font-medium hover:underline">
                                Forgot password?
                            </button>
                        </div>

                        <Button type="submit" loading={isSubmitting} className="w-full py-3 text-base">
                            <Lock className="w-4 h-4" />
                            Sign In Securely
                        </Button>
                    </form>

                    <div className="mt-5 p-3.5 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="flex items-start gap-2">
                            <Shield className="w-4 h-4 text-civic-blue flex-shrink-0 mt-0.5" />
                            <div className="text-xs text-gray-600">
                                <strong>Demo credentials:</strong><br />
                                Email: admin@civic.gov<br />
                                Password: admin123
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 text-center">
                        <Link href="/citizen" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                            ← Back to Citizen Portal
                        </Link>
                    </div>
                </div>

                <p className="text-center text-blue-300 text-xs mt-5">
                    Powered by Cascade Technologies Solutions<br />
                    Secured with 256-bit SSL encryption
                </p>
            </div>
        </div>
    );
}
