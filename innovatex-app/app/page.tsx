"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ReactLenis, useLenis } from "lenis/react";
import { useApp } from "@/context/AppContext"; // Import User Context
import {
  Leaf,
  ArrowRight,
  Globe,
  ScanLine,
  Box,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(useGSAP);

/* --------------------------------------------------------------------------
   COMPONENTS
   -------------------------------------------------------------------------- */

const Navbar = () => {
  const { user } = useApp(); // Get user state to handle button logic

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-6 flex justify-between items-center mix-blend-difference text-[#F3F6F4]"
    >
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-[#D4FF47] rounded-full flex items-center justify-center text-[#0A3323]">
          <Leaf size={20} strokeWidth={2.5} />
        </div>
        <span className="text-xl font-serif font-bold tracking-tight">
          Eco-Loop
        </span>
      </div>

      <div className="hidden md:flex gap-8 font-medium text-sm uppercase tracking-widest">
        {["Manifesto", "Features", "Impact"].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase()}`}
            className="hover:text-[#D4FF47] transition-colors"
          >
            {item}
          </a>
        ))}
      </div>

      {/* Dynamic Link: Goes to Dashboard if logged in, otherwise Login */}
      <Link href={user ? "/dashboard" : "/login"}>
        <button className="group relative px-6 py-3 rounded-full border border-[#F3F6F4]/30 overflow-hidden bg-transparent hover:bg-[#D4FF47] transition-colors duration-300">
          <span className="relative z-10 text-xs font-bold uppercase tracking-wider group-hover:text-[#0A3323] transition-colors">
            {user ? "Open Dashboard" : "Launch App"}
          </span>
        </button>
      </Link>
    </motion.nav>
  );
};

const Hero = () => {
  const container = useRef(null);
  const textRef = useRef(null);

  useGSAP(
    () => {
      const tl = gsap.timeline();

      tl.from(".hero-text-line", {
        y: 200,
        duration: 1.5,
        stagger: 0.1,
        ease: "power4.out",
        skewY: 7,
      }).from(
        ".hero-sub",
        {
          opacity: 0,
          y: 20,
          duration: 1,
          ease: "power2.out",
        },
        "-=1"
      );
    },
    { scope: container }
  );

  return (
    <section
      ref={container}
      className="relative h-screen w-full bg-[#0A3323] flex flex-col justify-center px-6 lg:px-20 overflow-hidden"
    >
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 60,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Pulsing Glow Orb */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-[#D4FF47] rounded-full blur-[150px] opacity-5 pointer-events-none"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.05, 0.08, 0.05],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="relative z-10 mt-20">
        <div className="overflow-hidden">
          <h1 className="ml-8 pl-2 hero-text-line text-[10vw] leading-[0.85] font-serif text-[#F3F6F4] mix-blend-difference cursor-default">
            <motion.span
              className="inline-block"
              whileHover={{ scale: 1.05, color: "#D4FF47" }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              Sustainability
            </motion.span>
          </h1>
        </div>
        <div className="overflow-hidden">
          <h1 className="ml-8 pl-2 hero-text-line text-[10vw] leading-[0.85] font-serif text-[#D4FF47] cursor-default">
            <motion.span
              className="inline-block"
              whileHover={{ scale: 1.05, color: "#F3F6F4" }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              Reimagined.
            </motion.span>
          </h1>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-end mt-12 hero-sub">
          <p className="text-[#F3F6F4]/80 text-lg md:text-xl max-w-md font-light leading-relaxed ml-12 pl-2">
            The operating system for your kitchen. Track inventory, reduce
            waste, and automate your grocery cycle with AI-driven intelligence.
          </p>
          <div className="mt-8 md:mt-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full border border-[#F3F6F4]/20 flex items-center justify-center text-[#F3F6F4]">
                <ArrowUpRight />
              </div>
              <span className="text-[#F3F6F4] text-sm uppercase tracking-widest">
                Scroll to explore
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Marquee = () => {
  const firstText = useRef(null);
  const secondText = useRef(null);
  const slider = useRef(null);

  // Use refs for animation state to persist across renders without re-triggering them
  const xPercent = useRef(0);
  const direction = useRef(-1);
  const speed = useRef(1); // Current speed multiplier
  const targetSpeed = useRef(1); // Target speed (1 = normal, 0.1 = slow)
  const requestRef = useRef<number | null>(null); // Initialized with null

  useGSAP(() => {
    const animate = () => {
      if (xPercent.current <= -100) xPercent.current = 0;
      if (xPercent.current > 0) xPercent.current = -100;

      // Smoothly interpolate current speed towards target speed
      speed.current += (targetSpeed.current - speed.current) * 0.05;

      gsap.set(firstText.current, { xPercent: xPercent.current });
      gsap.set(secondText.current, { xPercent: xPercent.current });

      // Apply the speed multiplier to the movement
      xPercent.current += 0.1 * direction.current * speed.current;

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  });

  return (
    <div
      className="relative flex overflow-hidden bg-[#D4FF47] py-8 cursor-default"
      // Set target speed on hover events
      onMouseEnter={() => {
        targetSpeed.current = 0.1;
      }}
      onMouseLeave={() => {
        targetSpeed.current = 1;
      }}
    >
      <div className="absolute top-0 w-full h-px bg-[#0A3323]/10" />
      <div ref={slider} className="flex whitespace-nowrap">
        <p
          ref={firstText}
          className="text-[#0A3323] text-[5vw] font-bold uppercase tracking-tighter pr-12"
        >
          Zero Waste • Smart Pantry • Save Money • Eco Loop •
        </p>
        <p
          ref={secondText}
          className="text-[#0A3323] text-[5vw] font-bold uppercase tracking-tighter pr-12"
        >
          Zero Waste • Smart Pantry • Save Money • Eco Loop •
        </p>
      </div>
    </div>
  );
};

const FeaturesHorizontal = () => {
  const sectionRef = useRef(null);
  const triggerRef = useRef(null);

  useGSAP(() => {
    const pin = gsap.fromTo(
      sectionRef.current,
      { translateX: 0 },
      {
        translateX: "-200vw",
        ease: "none",
        duration: 1,
        scrollTrigger: {
          trigger: triggerRef.current,
          start: "top top",
          end: "+=3000",
          scrub: 0.6,
          pin: true,
        },
      }
    );
    return () => {
      pin.kill();
    };
  });

  const features = [
    {
      id: "01",
      title: "Smart Scan",
      desc: "Snap a photo of your grocery receipt. Our AI catalogs everything in seconds, turning paper into digital inventory.",
      icon: ScanLine,
      image: "/images/1.jpg",
    },
    {
      id: "02",
      title: "Live Inventory",
      desc: "Know exactly what you have. Get automated notifications before food expires so you can cook it, not toss it.",
      icon: Box,
      image: "/images/2.jpg",
    },
    {
      id: "03",
      title: "Impact Score",
      desc: "Gamify your sustainability. Track your carbon footprint reduction in real-time and compete with your neighborhood.",
      icon: Sparkles,
      image: "/images/3.jpg",
    },
  ];

  return (
    <section
      ref={triggerRef}
      id="features" // Added ID for navigation
      className="w-full h-screen overflow-hidden bg-[#0A3323]"
    >
      <div ref={sectionRef} className="h-full flex w-[300vw]">
        {features.map((f, i) => (
          <div
            key={i}
            className="w-screen h-full relative flex items-center justify-center px-12 overflow-hidden"
          >
            {/* Background Image with Parallax Feel */}
            <div className="absolute inset-0 z-0">
              <img
                src={f.image}
                alt={f.title}
                className="w-full h-full object-cover opacity-60 grayscale-[20%] hover:grayscale-0 transition-all duration-700 transform scale-105"
              />
              {/* Cinematic Overlay for Text Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A3323] via-[#0A3323]/80 to-[#0A3323]/30 mix-blend-multiply" />
              <div className="absolute inset-0 bg-black/20" />
            </div>

            <div className="relative z-10 max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="order-2 md:order-1">
                <span
                  className="block text-[12vw] md:text-[8rem] font-serif leading-none text-transparent stroke-text opacity-30 mb-4 font-bold"
                  style={{ WebkitTextStroke: "2px #D4FF47" }}
                >
                  {f.id}
                </span>
                <h2 className="text-5xl md:text-7xl font-bold mb-8 text-[#F3F6F4] leading-tight">
                  {f.title}{" "}
                  <span className="text-[#D4FF47] block text-2xl md:text-3xl font-serif font-light italic mt-2">
                    Feature unlocked
                  </span>
                </h2>
                <p className="text-lg md:text-2xl text-[#F3F6F4]/80 max-w-md leading-relaxed backdrop-blur-sm">
                  {f.desc}
                </p>
              </div>

              <div className="order-1 md:order-2 flex justify-center">
                <div className="h-[40vh] w-[40vh] md:h-[50vh] md:w-[50vh] bg-[#F3F6F4]/10 rounded-full border border-[#D4FF47]/30 backdrop-blur-md flex items-center justify-center relative group">
                  <div className="absolute inset-0 bg-[#D4FF47] rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity duration-500" />

                  <motion.div
                    whileHover={{
                      scale: 1.2,
                      rotate: 90,
                      filter: "drop-shadow(0 0 15px #D4FF47)",
                    }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="relative z-10"
                  >
                    <f.icon
                      size={140}
                      className="text-[#D4FF47]"
                      strokeWidth={1}
                    />
                  </motion.div>

                  {/* Orbiting Decorative Ring */}
                  <div className="absolute inset-4 border border-[#F3F6F4]/20 rounded-full border-dashed animate-[spin_20s_linear_infinite]" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// Helper component to split text into characters for the typewriter effect
const Split = ({
  children,
  className,
}: {
  children: string;
  className?: string;
}) => {
  return (
    <span className={className}>
      {children.split("").map((char, i) => (
        <span
          key={i}
          className="typewriter-char opacity-0 inline-block"
          style={{ whiteSpace: "pre" }}
        >
          {char}
        </span>
      ))}
    </span>
  );
};

const Manifesto = () => {
  const container = useRef(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container.current,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      });

      // Animate the typewriter characters
      tl.to(".typewriter-char", {
        opacity: 1,
        duration: 0.2,
        stagger: 0.03,
        ease: "none",
      })
        // Animate stats sliding up after text
        .from(
          ".manifesto-stat",
          {
            y: 40,
            opacity: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: "power3.out",
          },
          "-=0.5"
        );
    },
    { scope: container }
  );

  return (
    <section
      ref={container}
      className="py-32 px-6 lg:px-20 bg-[#0A3323] text-[#F3F6F4]"
      id="manifesto"
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-xl md:text-3xl font-light leading-relaxed opacity-80 mb-12">
          {/* FIXED: Apply Split only to text strings */}
          <div>
            <Split>
              The modern kitchen is broken. We buy too much, eat too little, and
              throw away the rest.
            </Split>{" "}
            <Split className="text-[#D4FF47] font-medium">
              It&apos;s a design flaw.
            </Split>
          </div>
        </div>

        {/* FIXED: Apply Split only to text strings */}
        <h2 className="text-5xl md:text-8xl font-serif leading-tight">
          <Split>We built Eco-Loop to</Split> <br />
          <span className="italic text-[#D4FF47]">
            <Split>close the circle</Split>
          </span>{" "}
          <br />
          <Split>on consumption.</Split>
        </h2>

        <div
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
          id="impact"
        >
          {[
            { label: "Households", value: "500+" },
            { label: "Waste Saved", value: "1.2k kg" },
            { label: "Money Saved", value: "$45k" },
          ].map((stat, i) => (
            <div
              key={i}
              className="manifesto-stat border-t border-[#F3F6F4]/20 pt-6"
            >
              <h3 className="text-5xl font-bold text-[#D4FF47] mb-2">
                {stat.value}
              </h3>
              <p className="uppercase tracking-widest text-xs">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-[#0A3323] text-[#F3F6F4] pt-20 pb-10 px-6">
      <div className="w-full h-px bg-[#F3F6F4]/20 mb-20" />
      <div className="flex flex-col items-center justify-center text-center">
        <h2 className="text-[15vw] font-serif leading-none text-[#D4FF47] mb-10">
          Eco-Loop
        </h2>
        <Link href="/login">
          <button className="bg-[#F3F6F4] text-[#0A3323] px-12 py-6 rounded-full text-xl font-bold hover:bg-[#D4FF47] hover:scale-105 transition-all duration-300">
            Get Started Now
          </button>
        </Link>
      </div>
      <div className="flex justify-between items-end mt-32 text-xs uppercase tracking-widest opacity-50">
        <span>© 2024 Eco-Loop Inc.</span>
        <span>Designed for Sustainability</span>
      </div>
    </footer>
  );
};

/* --------------------------------------------------------------------------
   MAIN PAGE LAYOUT
   -------------------------------------------------------------------------- */

export default function LandingPage() {
  return (
    <ReactLenis root>
      <main className="bg-[#0A3323] min-h-screen cursor-default selection:bg-[#D4FF47] selection:text-[#0A3323]">
        <Navbar />
        <Hero />
        <Marquee />
        <FeaturesHorizontal />
        <Manifesto />
        <Footer />
      </main>
    </ReactLenis>
  );
}
