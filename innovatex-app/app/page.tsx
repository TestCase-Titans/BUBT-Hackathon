'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ReactLenis } from '@studio-freight/react-lenis';
import { Leaf, ArrowRight, Globe, ScanLine, Box, Sparkles, ArrowUpRight } from 'lucide-react';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(useGSAP);

/* --------------------------------------------------------------------------
   COMPONENTS
   -------------------------------------------------------------------------- */

const Navbar = () => (
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
      <span className="text-xl font-serif font-bold tracking-tight">Eco-Loop</span>
    </div>
    <div className="hidden md:flex gap-8 font-medium text-sm uppercase tracking-widest">
      {['Manifesto', 'Features', 'Impact'].map((item) => (
        <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-[#D4FF47] transition-colors">{item}</a>
      ))}
    </div>
    <Link href="/login">
      <button className="group relative px-6 py-3 rounded-full border border-[#F3F6F4]/30 overflow-hidden bg-transparent hover:bg-[#D4FF47] transition-colors duration-300">
        <span className="relative z-10 text-xs font-bold uppercase tracking-wider group-hover:text-[#0A3323] transition-colors">
          Launch App
        </span>
      </button>
    </Link>
  </motion.nav>
);

const Hero = () => {
  const container = useRef(null);
  const textRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline();
    
    tl.from('.hero-text-line', {
      y: 200,
      duration: 1.5,
      stagger: 0.1,
      ease: 'power4.out',
      skewY: 7
    })
    .from('.hero-sub', {
      opacity: 0,
      y: 20,
      duration: 1,
      ease: 'power2.out'
    }, '-=1');
  }, { scope: container });

  return (
    <section ref={container} className="relative h-screen w-full bg-[#0A3323] flex flex-col justify-center px-6 lg:px-20 overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-[#D4FF47] rounded-full blur-[150px] opacity-5 pointer-events-none" />

      <div className="relative z-10 mt-20">
        <div className="overflow-hidden">
          <h1 className="hero-text-line text-[12vw] leading-[0.85] font-serif text-[#F3F6F4] mix-blend-difference">
            Sustainability
          </h1>
        </div>
        <div className="overflow-hidden">
          <h1 className="hero-text-line text-[12vw] leading-[0.85] font-serif text-[#D4FF47]">
            Reimagined.
          </h1>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-end mt-12 hero-sub">
          <p className="text-[#F3F6F4]/80 text-lg md:text-xl max-w-md font-light leading-relaxed">
            The operating system for your kitchen. Track inventory, reduce waste, and automate your grocery cycle with AI-driven intelligence.
          </p>
          <div className="mt-8 md:mt-0">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border border-[#F3F6F4]/20 flex items-center justify-center text-[#F3F6F4]">
                   <ArrowUpRight />
                </div>
                <span className="text-[#F3F6F4] text-sm uppercase tracking-widest">Scroll to explore</span>
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
  let xPercent = 0;
  let direction = -1;

  useGSAP(() => {
    requestAnimationFrame(animate);
  });

  const animate = () => {
    if (xPercent <= -100) xPercent = 0;
    if (xPercent > 0) xPercent = -100;
    gsap.set(firstText.current, { xPercent: xPercent });
    gsap.set(secondText.current, { xPercent: xPercent });
    xPercent += 0.1 * direction;
    requestAnimationFrame(animate);
  };

  return (
    <div className="relative flex overflow-hidden bg-[#D4FF47] py-8">
      <div className="absolute top-0 w-full h-px bg-[#0A3323]/10" />
      <div ref={slider} className="flex whitespace-nowrap">
        <p ref={firstText} className="text-[#0A3323] text-[5vw] font-bold uppercase tracking-tighter pr-12">
          Zero Waste • Smart Pantry • Save Money • Eco Loop • 
        </p>
        <p ref={secondText} className="text-[#0A3323] text-[5vw] font-bold uppercase tracking-tighter pr-12">
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
          end: "+=2000",
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
      desc: "Snap a photo of your grocery receipt. Our AI catalogs everything in seconds.",
      icon: ScanLine,
      color: "bg-[#F3F6F4]",
      text: "text-[#0A3323]"
    },
    {
      id: "02",
      title: "Live Inventory",
      desc: "Know exactly what you have. Get notified before food expires.",
      icon: Box,
      color: "bg-[#0A3323]",
      text: "text-[#F3F6F4]"
    },
    {
      id: "03",
      title: "Impact Score",
      desc: "Gamify your sustainability. Track carbon footprint reduction in real-time.",
      icon: Sparkles,
      color: "bg-[#D4FF47]",
      text: "text-[#0A3323]"
    }
  ];

  return (
    <section ref={triggerRef} className="w-full h-screen overflow-hidden bg-[#F3F6F4]">
      <div ref={sectionRef} className="h-full flex w-[300vw]">
        {features.map((f, i) => (
          <div key={i} className={`w-screen h-full ${f.color} flex items-center justify-center px-12 relative`}>
            <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
               <div>
                  <span className={`block text-9xl font-serif opacity-20 mb-8 ${f.text}`}>{f.id}</span>
                  <h2 className={`text-6xl md:text-7xl font-bold mb-6 ${f.text} leading-tight`}>{f.title}</h2>
                  <p className={`text-xl md:text-2xl ${f.text} opacity-80 max-w-md`}>{f.desc}</p>
               </div>
               <div className="h-[50vh] bg-black/5 rounded-3xl border border-black/5 backdrop-blur-sm flex items-center justify-center relative overflow-hidden group">
                   <div className={`absolute inset-0 bg-gradient-to-br ${f.id === '02' ? 'from-[#D4FF47]/20 to-transparent' : 'from-[#0A3323]/10 to-transparent'}`} />
                   <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                   >
                      <f.icon size={120} className={f.text} />
                   </motion.div>
               </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const Manifesto = () => {
  return (
    <section className="py-32 px-6 lg:px-20 bg-[#0A3323] text-[#F3F6F4]" id="manifesto">
       <div className="max-w-5xl mx-auto">
          <p className="text-xl md:text-3xl font-light leading-relaxed opacity-80 mb-12">
             The modern kitchen is broken. We buy too much, eat too little, and throw away the rest. 
             <span className="text-[#D4FF47]"> It's a design flaw. </span>
          </p>
          <h2 className="text-5xl md:text-8xl font-serif leading-tight">
             We built Eco-Loop to <br/>
             <span className="italic text-[#D4FF47]">close the circle</span> <br/>
             on consumption.
          </h2>
          
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                  { label: "Households", value: "500+" },
                  { label: "Waste Saved", value: "1.2k kg" },
                  { label: "Money Saved", value: "$45k" }
              ].map((stat, i) => (
                  <div key={i} className="border-t border-[#F3F6F4]/20 pt-6">
                      <h3 className="text-5xl font-bold text-[#D4FF47] mb-2">{stat.value}</h3>
                      <p className="uppercase tracking-widest text-xs">{stat.label}</p>
                  </div>
              ))}
          </div>
       </div>
    </section>
  )
}

const Footer = () => {
    return (
        <footer className="bg-[#0A3323] text-[#F3F6F4] pt-20 pb-10 px-6">
            <div className="w-full h-px bg-[#F3F6F4]/20 mb-20" />
            <div className="flex flex-col items-center justify-center text-center">
                <h2 className="text-[15vw] font-serif leading-none text-[#D4FF47] mb-10">Eco-Loop</h2>
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
    )
}

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