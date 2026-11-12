import Link from "next/link";
import Navbar from "@/components/Navbar";
import { ArrowUpRight, ArrowRight, Clock2, Cloud, ChevronRight, ImagePlus, Lock, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: <ArrowUpRight />,
    title: "Easy Access",
    description:
      "Guests can join with a link or QR code and upload photos and videos without creating an account.",
  },
  {
    icon: <Lock />,
    title: "Private & Secure",
    description:
      "Your event is protected with password access and secure cloud storage.",
  },
  {
    icon: <Cloud />,
    title: "Auto Deletion",
    description:
      "Your photos and videos are kept for 2 days after the event, then automatically deleted.",
  },
  {
    icon: <Clock2 />,
    title: "Anywhere, Anytime",
    description:
      "View and download your memories from any device, whenever you want to relive them.",
  },
];

const steps = [
  {
    number: "01",
    title: "Create your event",
    description:
      "Set up an album in minutes and choose your event date.",
  },
  {
    number: "02",
    title: "Invite your guests",
    description:
      "Share one simple link or QR code with everyone at your event.",
  },
  {
    number: "03",
    title: "Collect the memories",
    description:
      "Guests upload directly from their phones. No account required.",
  },
];

const galleryImages = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1460364157752-926555421a7e?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=500&q=80",
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f5f0e8] text-[#3f3934]">

      {/* ==================== NAVBAR ==================== */}

      <Navbar />


      {/* ==================== HERO ==================== */}

      <section className="relative px-6 pb-12 pt-28 sm:pt-32 lg:px-10 lg:pb-10 lg:pt-28">

        <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr] xl:gap-12 2xl:gap-16">

          {/* Hero text */}

          <div className="relative z-10 max-w-xl">

            <p className="mb-6 text-xs font-medium uppercase tracking-[0.3em] text-[#4f6053]">
              Your moments. Forever.
            </p>

            <h1 className="text-[clamp(2.8rem,5.2vw,5.5rem)] font-normal leading-[0.92] tracking-[-0.055em] xl:text-[clamp(5rem,5.2vw,6.25rem)]">
              The easiest way to collect and share your memories.
            </h1>

            <p className="mt-8 max-w-lg text-base leading-7 text-[#54483f]/65 md:text-lg">
              MementoCloud lets you create private event albums where you
              and your guests can upload photos and videos - no account
              needed. Keep your special moments safe, organized, and easy
              to relive.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-5">

              <Link
                href="/signup"
                className="rounded-full bg-[#5f6f62] px-7 py-3.5 text-sm font-medium text-[#f5f0e8] transition hover:-translate-y-1 hover:bg-[#4f6053]"
              >
                Get Started
              </Link>

              <a
                href="#how-it-works"
                className="rounded-full border border-[#54483f] hover:bg-[#54483f] hover:shadow-xl px-7 py-3.5 text-sm font-medium text-[#54483f] hover:text-[#f5f0e8] hover:transition hover:-translate-y-1 "
              >
                See How It Works
              </a>

            </div>

          </div>


          {/* Hero image */}

          <div className="relative mx-auto w-full max-w-2xl lg:ml-auto">

            {/* Decorative blocks */}

            <div className="absolute -left-2 -top-2 h-[clamp(5rem,12vw,13rem)] w-[clamp(5rem,12vw,13rem)] bg-[#9b9a86]/60 sm:-left-3 sm:-top-3 lg:-left-8 lg:-top-5" />

            <div className="absolute -bottom-2 -right-2 h-[clamp(4rem,9vw,10rem)] w-[clamp(4rem,9vw,10rem)] bg-[#c9c1b8]/80 sm:-bottom-4 sm:-right-3 lg:-bottom-6 lg:-right-4" />

            {/* Image */}

            <div className="relative overflow-hidden border border-[#54483f]/10 bg-white p-3 shadow-[0_25px_70px_rgba(84,72,63,0.15)]">

              <div
                className="aspect-[1.22/1] bg-cover bg-center xl:aspect-[1.3/1]"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1400&q=85')",
                }}
              />

            </div>


            {/* Event card */}

            <div className="absolute -bottom-5 left-8 flex w-[calc(100%-32px)] max-w-2xs sm:max-w-sm items-center gap-3 rounded-xl bg-white/95 p-3 shadow-xl backdrop-blur">

              <div
                className="h-12 w-12 shrink-0 rounded-lg bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=200&q=80')",
                }}
              />

              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  Alondra&apos;s Wedding
                </p>

                <p className="text-xs text-[#54483f]/50">
                  245 photos · 12 videos
                </p>
              </div>

              <span className="ml-auto text-xl text-[#54483f]/50">
                <ChevronRight />
              </span>

            </div>

          </div>

        </div>

      </section>


      {/* ==================== FEATURES ==================== */}

      <section
        id="features"
        className="border-y border-[#54483f]/5 bg-[#faf7f1] px-6 py-16 sm:py-20 lg:px-10 lg:py-24 xl:py-28"
      >

        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12 xl:gap-20">

          {/* Text */}

          <div>

            <p className="mb-5 text-xs font-medium uppercase tracking-[0.3em] text-[#4f6053]">
              Built for real moments
            </p>

            <h2 className="max-w-xl text-4xl font-normal leading-[0.98] tracking-[-0.045em] sm:text-5xl lg:text-5xl xl:text-6xl">
              Simple. Secure.
              <br />
              Made for everyone.
            </h2>

            <p className="mt-6 max-w-lg text-sm leading-6 text-[#54483f]/60 sm:text-base sm:leading-7">
              Whether it&apos;s a wedding, birthday, family reunion, or a
              night with friend&apos;s, MementoCloud makes it easy to capture
              and share what matters most.
            </p>


            {/* Feature grid */}

            <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 xl:mt-12 xl:gap-x-10 xl:gap-y-10">

              {features.map((feature) => (
                <div key={feature.title}>

                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#c9c1b8]/60 text-lg text-[#54483f]">
                    {feature.icon}
                  </div>

                  <h3 className="mb-2 text-base font-medium">
                    {feature.title}
                  </h3>

                  <p className="max-w-xs text-sm leading-6 text-[#54483f]/60">
                    {feature.description}
                  </p>

                </div>
              ))}

            </div>

          </div>


          {/* Phone */}
{/*
          <div className="relative flex justify-center">

            <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#c9c1b8]/45 sm:h-96 sm:w-96 lg:h-104 lg:w-104 xl:h-120 xl:w-120" />

            <div className="relative z-10 w-64 overflow-hidden rounded-[2.7rem] border-[7px] border-[#54483f] bg-[#54483f] shadow-[0_30px_70px_rgba(84,72,63,0.2)] sm:w-72 lg:w-76 xl:w-80">

              <div className="aspect-9/19 bg-white">

                {/* Phone header image */}
{/*}
                <div
                  className="h-[38%] bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=800&q=85')",
                  }}
                >

                  <div className="flex h-full items-end bg-linear-to-t from-black/60 via-black/10 to-transparent p-5">

                    <div className="text-white">

                      <p className="text-lg font-medium">
                        Alondra&apos;s Wedding
                      </p>

                      <p className="mt-1 text-xs text-white/75">
                        April 16, 2021 · 245 photos
                      </p>

                    </div>

                  </div>

                </div>


                {/* Tabs */}
{/*
                <div className="flex border-b border-[#54483f]/10 text-xs">

                  <span className="w-1/2 border-b-2 border-[#5f6f62] px-4 py-3 text-center font-medium">
                    Photos
                  </span>

                  <span className="w-1/2 px-4 py-3 text-center text-[#54483f]/45">
                    Videos
                  </span>

                </div>


                {/* Gallery */}
{/*
                <div className="grid grid-cols-2 gap-1.5 p-2">

                  {galleryImages.map((image) => (
                    <div
                      key={image}
                      className="aspect-square overflow-hidden"
                    >
                      <div
                        className="h-full w-full bg-cover bg-center transition-transform duration-300 ease-out hover:scale-110 hover:shadow-lg"
                        style={{
                          backgroundImage: `url('${image}')`,
                        }}
                      />
                    </div>
                  ))}

                </div>

              </div>

            </div>

          </div>

        </div> */}
          {/* Phone — actual event page layout with example content */}

          <div className="relative flex justify-center">
            <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#c9c1b8]/45 sm:h-96 sm:w-96 lg:h-104 lg:w-104 xl:h-120 xl:w-120" />

            <div className="relative z-10 w-64 overflow-hidden rounded-[2.7rem] border-[7px] border-[#54483f] bg-[#f5f0e8] shadow-[0_30px_70px_rgba(84,72,63,0.2)] sm:w-72 lg:w-76 xl:w-80">
              {/* Phone screen */}
              <div className="aspect-[9/19] overflow-y-auto bg-[#f5f0e8] [scrollbar-width:none]">
                {/* Header */}
                <header className="border-b border-[#c9c1b8]/50">
                  <div className="flex items-center justify-between gap-1 px-2.5 py-3">
                    <Link
                      href="/"
                      aria-label="MementoCloud home"
                      className="flex min-w-0 flex-1 items-center gap-1.5 text-[14px] font-medium tracking-tight text-[#54483f]"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-[#54483f]">
                        <Cloud className="h-4 w-4" />
                      </span>

                      <span className="whitespace-nowrap">MementoCloud</span>
                    </Link>

                    <span className="flex shrink-0 items-center gap-1 text-[9px] text-[#6d7565]">
                      <ShieldCheck className="h-3 w-3 shrink-0" strokeWidth={1.7} />
                      <span>Private album</span>
                    </span>
                  </div>
                </header>
                                

                <div className="px-3 py-4">
                  {/* Event heading */}
                  <div className="mb-4">
                    <p className="mb-1.5 text-[8px] font-medium uppercase tracking-[0.2em] text-[#5f6f62]">
                      Event album
                    </p>

                    <h3 className="text-xl font-normal leading-tight tracking-tight">
                      Alondra&apos;s Wedding
                    </h3>

                    <p className="mt-2 text-[9px] text-[#766b60]">
                      April 16, 2021 · 6 memories
                    </p>
                  </div>

                  {/* Upload section — visual preview */}
                  <div className="mb-5 rounded-xl border border-[#c9c1b8]/60 bg-white/70 p-3">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-[#e8eee6] p-2 text-[#5f6f62]">
                        <ImagePlus size={14} />
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold">
                          Share your photos
                        </p>
                        <p className="mt-0.5 text-[8px] leading-3 text-[#766b60]">
                          Add your favorite moments to the album.
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-center gap-1.5 rounded-lg border border-[#b9c3b5] bg-white px-2 py-2 text-[9px] font-medium text-[#4d5b50]">
                      <ImagePlus size={12} />
                      Choose images
                    </div>
                  </div>

                  {/* Gallery heading */}
                  <div className="mb-3 flex items-end justify-between">
                    <div>
                      <p className="mb-1 text-[8px] font-medium uppercase tracking-[0.18em] text-[#5f6f62]">
                        The collection
                      </p>
                      <h4 className="text-base font-normal tracking-tight">
                        All memories
                      </h4>
                    </div>

                    <span className="text-sm text-[#766b60] underline underline-offset-4">
                      Refresh
                    </span>
                  </div>

                  {/* Example wedding images */}
                  <div className="columns-2 gap-1.5">
                    {galleryImages.map((image, index) => (
                      <div
                        key={image}
                        className="mb-1.5 break-inside-avoid overflow-hidden rounded-[2px] bg-[#e6e4d9]"
                      >
                        <img
                          src={image}
                          alt={`Wedding memory ${index + 1}`}
                          loading="lazy"
                          className="block h-auto w-full"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="mt-4 border-t border-[#c9c1b8]/50 py-3 text-center text-[8px] text-[#8b8176]">
                    Shared with love, kept private.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ==================== HOW IT WORKS ==================== */}

      <section
        id="how-it-works"
        className="px-6 py-24 lg:px-10 lg:py-32"
      >

        <div className="mx-auto max-w-7xl">

          <div className="max-w-2xl">

            <p className="mb-5 text-xs font-medium uppercase tracking-[0.3em] text-[#4f6053]">
              How it works
            </p>

            <h2 className="text-5xl font-normal leading-none tracking-[-0.045em] md:text-6xl">
              One event.
              <br />
              Everyone&apos;s memories.
            </h2>

          </div>


          {/* Steps */}

          <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-[#54483f]/10 bg-[#54483f]/10 md:grid-cols-3">

            {steps.map((step) => (
              <div
                key={step.number}
                className="group bg-[#faf7f1] p-8 md:p-10 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:bg-white hover:shadow-[0_12px_30px_rgba(84,72,63,0.10)]"
              >

                <p className="text-xs tracking-[0.2em] text-[#4f6053] transition-colors duration-300 group-hover:text-[#5f6f62]">
                  {step.number}
                </p>

                <h3 className="mt-16 text-2xl tracking-tight transition-transform duration-300 group-hover:translate-x-1">
                  {step.title}
                </h3>

                <p className="mt-4 max-w-xs text-sm leading-6 text-[#54483f]/55">
                  {step.description}
                </p>

              </div>
            ))}

          </div>

        </div>

      </section>


      {/* ==================== CTA ==================== */}

      <section
        className="relative overflow-hidden px-6 py-24 lg:px-10 lg:py-32"
      >

        {/* Background */}

        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(rgba(60,52,45,.45), rgba(60,52,45,.45)), url('https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=2000&q=85')",
          }}
        />


        <div className="relative mx-auto flex max-w-7xl items-end justify-between gap-10">

          <div className="max-w-xl text-[#f5f0e8]">

            <p className="mb-5 text-xs font-medium uppercase tracking-[0.3em] text-[#f5f0e8]/75">
              Start your next event
            </p>

            <h2 className="text-5xl font-normal leading-[0.95] tracking-[-0.045em] md:text-7xl">
              Capture what matters most.
            </h2>

            <p className="mt-6 max-w-md text-base leading-7 text-[#f5f0e8]/75">
              Create your event album in minutes and invite your guests
              to start sharing.
            </p>

            <Link
              href="/create"
              className="mt-8 inline-flex items-center justify-between rounded-full bg-[#f5f0e8] px-6 py-3.5 text-sm font-medium text-[#54483f] transition hover:-translate-y-1"
            >
              Get Started
              <ArrowRight size={14}/>
            </Link>

          </div>


          {/* Polaroid images */}

          <div className="hidden rotate-6 gap-[-20px] lg:flex">

            <div
              className="h-52 w-40 -rotate-6 border-8 border-white bg-cover bg-center shadow-2xl"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=500&q=80')",
              }}
            />

            <div
              className="h-56 w-44 translate-y-5 border-8 border-white bg-cover bg-center shadow-2xl"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=500&q=80')",
              }}
            />

          </div>

        </div>

      </section>


      {/* ==================== FOOTER ==================== */}

      <footer className="bg-[#54483f] px-6 py-14 text-[#f5f0e8] lg:px-10">

        <div className="mx-auto max-w-7xl">

          <div className="flex flex-col justify-between gap-10 md:flex-row">

            {/* Branding */}

            <div>

              <div className="flex items-center gap-2.5 text-2xl font-medium">

                <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#f5f0e8]/50">
                  <Cloud />
                </span>

                MementoCloud

              </div>

              <p className="mt-4 text-sm text-[#f5f0e8]/50">
                Real moments. Lasting memories.
              </p>

            </div>


            {/* Footer links */}

            <div className="flex gap-14 text-sm text-[#f5f0e8]/60">

              <div className="flex flex-col gap-4">

                <a
                  href="#features"
                  className="hover:text-[#f5f0e8]"
                >
                  Features
                </a>

                <a
                  href="#how-it-works"
                  className="hover:text-[#f5f0e8]"
                >
                  How It Works
                </a>

              </div>

              <div className="flex flex-col gap-4">

                <Link
                  href="/login"
                  className="hover:text-[#f5f0e8]"
                >
                  Sign In
                </Link>

              </div>

            </div>

          </div>

        </div>

      </footer>

    </main>
  );
}