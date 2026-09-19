import React, { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, BarChart3, Camera, CheckCircle2, ChevronRight, LayoutDashboard, MapPin, ShieldCheck, Users, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';

const Landing: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-[#fafafa] text-zinc-900 selection:bg-zinc-200">
      {/* Premium Navbar */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b ${scrolled ? 'bg-white/80 backdrop-blur-md border-zinc-200 shadow-sm py-3' : 'bg-transparent border-transparent py-5'}`}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white text-[10px] font-bold tracking-wider group-hover:rotate-[5deg] transition-transform shadow-sm">
              MD
            </div>
            <span className="text-sm font-semibold tracking-tight text-zinc-900">
              Mysuru<span className="text-zinc-500 font-medium">Drishti</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600">
            <a href="#product" className="hover:text-zinc-900 transition-colors">Product</a>
            <a href="#how-it-works" className="hover:text-zinc-900 transition-colors">How it works</a>
            <Link to="/access/admin" className="hover:text-zinc-900 transition-colors">Admin</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/access/worker" className="hidden md:block text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">Worker Portal</Link>
            <Link to="/access/public" className="btn-premium btn-primary px-4 py-2 flex gap-2">
              Report Issue <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none -z-10" />
        
        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-medium text-zinc-600 mb-8 hover:bg-zinc-200 transition-colors cursor-default">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 animate-pulse" />
              Mysuru City Corporation Official Initiative
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tighter text-zinc-950 max-w-4xl leading-[1.05]">
              Verify civic work with <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 to-zinc-500">absolute certainty.</span>
            </h1>
            
            <p className="mt-8 text-lg md:text-xl text-zinc-500 max-w-2xl font-normal leading-relaxed">
              An AI-powered municipal verification platform that connects citizens, field workers, and the control room around irrefutable before-and-after photo evidence.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link to="/access/public" className="btn-premium btn-primary px-8 py-3.5 text-base w-full sm:w-auto shadow-lg shadow-zinc-900/10">
                Citizen Login <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
              <Link to="/access/worker" className="btn-premium btn-secondary px-8 py-3.5 text-base w-full sm:w-auto">
                Worker Portal
              </Link>
            </div>
          </div>
          
          {/* Abstract Dashboard Preview */}
          <div className="mt-24 relative mx-auto max-w-5xl rounded-2xl border border-zinc-200/50 bg-white/50 backdrop-blur-sm p-2 shadow-2xl shadow-zinc-200/50 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 ease-out fill-mode-both">
            <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-white/0 rounded-2xl pointer-events-none" />
            <div className="rounded-xl overflow-hidden border border-zinc-200 bg-white">
              <div className="h-12 border-b border-zinc-100 flex items-center px-4 gap-2 bg-zinc-50/50">
                <div className="w-3 h-3 rounded-full bg-zinc-200" />
                <div className="w-3 h-3 rounded-full bg-zinc-200" />
                <div className="w-3 h-3 rounded-full bg-zinc-200" />
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-1 space-y-4">
                  <div className="h-8 w-32 bg-zinc-100 rounded-md" />
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-16 w-full border border-zinc-100 rounded-lg p-3 flex gap-3">
                        <div className="w-10 h-10 bg-zinc-100 rounded flex-shrink-0" />
                        <div className="space-y-2 w-full">
                          <div className="h-3 w-1/2 bg-zinc-200 rounded" />
                          <div className="h-2 w-1/3 bg-zinc-100 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-span-2 bg-zinc-50 rounded-xl border border-zinc-100 flex flex-col justify-between p-6">
                  <div className="flex justify-between items-center">
                    <div className="h-6 w-40 bg-zinc-200 rounded" />
                    <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">AI VERIFIED</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-6 h-48">
                    <div className="bg-zinc-200 rounded-lg relative overflow-hidden flex items-end p-3">
                      <div className="bg-white/90 backdrop-blur-sm text-[10px] font-bold px-2 py-1 rounded text-zinc-600">BEFORE</div>
                    </div>
                    <div className="bg-zinc-200 rounded-lg relative overflow-hidden flex items-end p-3">
                      <div className="bg-white/90 backdrop-blur-sm text-[10px] font-bold px-2 py-1 rounded text-zinc-600">AFTER</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="how-it-works" className="py-24 bg-white border-t border-zinc-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-900">End-to-end accountability.</h2>
            <p className="mt-4 text-zinc-500 text-lg max-w-2xl">A seamless workflow that eliminates ambiguity from municipal maintenance.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: MapPin,
                title: "1. Citizen Report",
                desc: "Citizens pinpoint issues on a live map and attach initial photo evidence.",
                link: "/access/public"
              },
              {
                icon: LayoutDashboard,
                title: "2. Smart Assignment",
                desc: "The system automatically routes the complaint to the designated worker for that geographic polygon.",
                link: "/access/worker"
              },
              {
                icon: CheckCircle2,
                title: "3. AI Verification",
                desc: "Workers upload completion photos. Google Gemini validates the resolution before closing.",
                link: "/access/admin"
              }
            ].map((feature, i) => (
              <div key={i} className="group relative p-8 rounded-2xl bg-zinc-50 border border-zinc-100 hover:border-zinc-300 transition-colors duration-300 flex flex-col h-full">
                <div className="w-12 h-12 bg-white rounded-xl border border-zinc-200 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-5 h-5 text-zinc-700" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-900 mb-3">{feature.title}</h3>
                <p className="text-zinc-500 leading-relaxed flex-grow">{feature.desc}</p>
                <Link to={feature.link} className="inline-flex items-center gap-1 mt-8 text-sm font-semibold text-zinc-900 group-hover:gap-2 transition-all">
                  Access Portal <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-zinc-200 rounded flex items-center justify-center text-zinc-500 text-[8px] font-bold">MD</div>
            <span className="text-sm font-semibold text-zinc-500">MysuruDrishti</span>
          </div>
          <p className="text-sm text-zinc-400">© 2026 Mysuru City Corporation.</p>
        </div>
      </footer>
    </main>
  );
};

export default Landing;
