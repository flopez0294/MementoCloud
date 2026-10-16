import Link from "next/link";
import { Cloud } from "lucide-react";


export default function Navbar() {
  return (
    <header className="absolute inset-x-0 top-0 z-50">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">

          <Link
            href="/"
            className="flex items-center gap-2.5 text-2xl font-medium tracking-tight"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full border-2">
              <Cloud />
            </span>

            MementoCloud
          </Link>

          {/* Desktop navigation */}
          <div className="hidden items-center gap-10 text-sm text-[#54483f]/70 md:flex">
            <a
              href="#features"
              className="transition hover:text-[#54483f]"
            >
              Features
            </a>

            <a
              href="#how-it-works"
              className="transition hover:text-[#54483f]"
            >
              How It Works
            </a>
          </div>

          <div className="flex items-center gap-5 text-sm">
            <Link
              href="/login"
              className="hidden text-[#54483f]/80 transition hover:text-[#54483f] sm:block"
            >
              Sign In
            </Link>

            <Link
              href="/signup"
              className="rounded-full bg-[#5f6f62] px-5 py-2.5 font-medium text-[#f5f0e8] transition hover:-translate-y-0.5 hover:bg-[#4f6053]"
            >
              Get Started
            </Link>
          </div>

        </nav>
      </header>
  )
}