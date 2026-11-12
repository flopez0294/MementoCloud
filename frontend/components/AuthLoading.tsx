
import { Cloud } from "lucide-react";
import Link from "next/link";

export default function AuthLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f0e8] text-[#54483f]">
      <div className="flex flex-col items-center">
        {/* Cloud logo */}
         <Link
            href="/"
            className="flex items-center gap-2.5 text-2xl font-medium tracking-tight"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full border-2">
              <Cloud />
            </span>

            MementoCloud
          </Link>

        {/* Loading spinner */}
        <div className="mt-8 h-6 w-6 animate-spin rounded-full border-2 border-[#c9c1b8] border-t-[#5f6f62]" />

        <p className="mt-5 text-sm font-medium">
          Checking your session
        </p>

        <p className="mt-1 text-xs text-[#54483f]/50">
          Your moments are right where you left them.
        </p>
      </div>
    </main>
  );
}
