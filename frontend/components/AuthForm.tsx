
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthLoading from "@/components/AuthLoading";
import {
  ArrowRight,
  Cloud,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";

import {
  register,
  login,
  getAccessToken,
  saveAccessToken,
} from "@/lib/auth";

type AuthMode = "signin" | "signup";

type AuthFormProps = {
  mode: AuthMode;
};

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isSignUp = mode === "signup";

  useEffect(() => {
    const checkAuth = async () => {
      const token = getAccessToken();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (token) {
        router.replace("/");
      } else {
        setIsCheckingAuth(false);
      }
    };
    checkAuth();
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      if (isSignUp) {
        await register({ email, password });
      }

      const tokenData = await login(email, password);

      saveAccessToken(tokenData.access_token);

      router.push("/");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }
    
  if (isCheckingAuth) {
    return <AuthLoading />;
  }

  return (
    <main className="min-h-screen bg-[#f5f0e8] text-[#54483f]">
      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-20">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 text-[#3f3934] lg:px-10">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-2xl font-medium tracking-tight"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full border-2">
              <Cloud size={20} />
            </span>
            MementoCloud
          </Link>

          <Link
            href="/"
            className="text-sm text-[#54483f]/70 transition hover:text-[#54483f]"
          >
            Back to home
          </Link>
        </nav>
      </header>

      {/* Authentication content */}
      <section className="grid min-h-screen lg:grid-cols-2">
        {/* Left side */}
        <div className="relative hidden overflow-hidden bg-[#5f6f62] lg:flex lg:flex-col lg:justify-between lg:p-14 xl:p-20">
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full border border-[#f5f0e8]/15" />
          <div className="absolute -bottom-32 -left-20 h-120 w-120 rounded-full border border-[#f5f0e8]/15" />
          <div className="absolute bottom-16 right-16 h-44 w-44 bg-[#c9c1b8]/15" />

          <div className="relative z-10">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-[#f5f0e8]/70">
              Your moments. Forever.
            </p>

            <h1 className="mt-8 max-w-lg text-6xl font-normal leading-[0.98] tracking-tighter text-[#f5f0e8] xl:text-7xl">
              Every memory deserves a place.
            </h1>

            <p className="mt-6 max-w-md text-base leading-7 text-[#f5f0e8]/70">
              Bring everyone&apos;s photos and videos together in one private
              place. The moments you share are the ones you keep.
            </p>
          </div>

          {/* Photo collage */}
          <div className="relative z-10 mt-14 flex items-center justify-center gap-5">
            <div
              className="mt-10 h-56 w-40 rotate-[-7deg] border-8 border-[#f5f0e8] bg-cover bg-center shadow-2xl"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=500&q=80')",
              }}
            />

            <div
              className="h-64 w-48 rotate-[4deg] border-8 border-[#f5f0e8] bg-cover bg-center shadow-2xl"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=500&q=80')",
              }}
            />

            <div
              className="mt-12 h-48 w-36 rotate-[8deg] border-8 border-[#f5f0e8] bg-cover bg-center shadow-2xl"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=500&q=80')",
              }}
            />
          </div>

          <p className="relative z-10 mt-12 text-sm text-[#f5f0e8]/60">
            Real moments. Lasting memories.
          </p>
        </div>

        {/* Right side: form */}
        <div className="flex min-h-screen items-center justify-center px-6 pb-12 pt-28 sm:px-10 lg:px-12 lg:pt-12">
          <div className="w-full max-w-md">
            <div className="mb-10 lg:hidden">
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-[#5f6f62]">
                Your moments. Forever.
              </p>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.25em] text-[#5f6f62]">
                Welcome {isSignUp ? "aboard" : "back"}
              </p>

              <h2 className="text-4xl font-normal tracking-[-0.045em] sm:text-5xl">
                {isSignUp
                  ? "Create your account."
                  : "Good to see you."}
              </h2>

              <p className="mt-4 text-sm leading-6 text-[#54483f]/65">
                {isSignUp
                  ? "Start creating private albums for the moments that matter."
                  : "Sign in to manage your events and revisit your memories."}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#54483f]/40"
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    required
                    className="w-full rounded-xl border border-[#54483f]/15 bg-[#faf7f1] py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-[#54483f]/35 focus:border-[#5f6f62] focus:ring-2 focus:ring-[#5f6f62]/10"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium"
                  >
                    Password
                  </label>

                  {!isSignUp && (
                    <Link
                      href="/forgot-password"
                      className="text-xs text-[#5f6f62] transition hover:underline"
                    >
                      Forgot password?
                    </Link>
                  )}
                </div>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#54483f]/40"
                  />

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={
                      isSignUp ? "new-password" : "current-password"
                    }
                    placeholder={
                      isSignUp
                        ? "Create a password"
                        : "Enter your password"
                    }
                    minLength={isSignUp ? 8 : undefined}
                    required
                    className="w-full rounded-xl border border-[#54483f]/15 bg-[#faf7f1] py-3.5 pl-11 pr-12 text-sm outline-none transition placeholder:text-[#54483f]/35 focus:border-[#5f6f62] focus:ring-2 focus:ring-[#5f6f62]/10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#54483f]/45 transition hover:text-[#54483f]"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>

                </div>

                {isSignUp && (
                  <p className="mt-2 text-xs text-[#54483f]/50">
                    Use at least 8 characters.
                  </p>
                )}
              </div>

              {/* Submit */}
              {error && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#5f6f62] px-6 py-4 text-sm font-medium text-[#f5f0e8] transition hover:-translate-y-0.5 hover:bg-[#4f6053] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? "Please wait..."
                  : isSignUp
                    ? "Create Account"
                    : "Sign In"}

                {!isSubmitting && (
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                )}
              </button>
            </form>

            {/* Link to the other auth page */}
            <p className="mt-8 text-center text-sm text-[#54483f]/60">
              {isSignUp
                ? "Already have an account?"
                : "New to MementoCloud?"}{" "}

              <Link
                href={isSignUp ? "/login" : "/signup"}
                className="font-medium text-[#5f6f62] transition hover:underline"
              >
                {isSignUp ? "Sign in" : "Create an account"}
              </Link>
            </p>

            {/* Footer */}
            <div className="mt-10 border-t border-[#54483f]/10 pt-5 text-center">
              <p className="text-xs leading-5 text-[#54483f]/45">
                Your memories, your space. Guests can still upload to your
                event without creating an account.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
