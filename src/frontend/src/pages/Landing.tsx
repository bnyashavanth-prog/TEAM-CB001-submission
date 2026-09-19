import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Users, Wrench } from 'lucide-react';

const Landing: React.FC = () => (
  <main className="min-h-screen bg-slate-950 text-white">
    <section className="max-w-6xl mx-auto px-6 py-20">
      <p className="text-blue-400 font-semibold tracking-widest text-sm">MYSURU CITY CORPORATION</p>
      <h1 className="mt-4 text-5xl font-black max-w-3xl leading-tight">Report civic issues. Track the work. Verify the outcome with AI.</h1>
      <p className="mt-6 max-w-2xl text-slate-300 text-lg">MysuruDrishti connects residents, field workers, and the MCC control room around transparent photo evidence.</p>
      <div className="mt-10 flex flex-wrap gap-4">
        <Link to="/access/public" className="bg-blue-500 hover:bg-blue-400 px-6 py-3 rounded-lg font-bold">Public login or sign up</Link>
        <Link to="/access/worker" className="bg-white text-slate-900 hover:bg-slate-200 px-6 py-3 rounded-lg font-bold">Worker login or sign up</Link>
        <Link to="/access/admin" className="border border-slate-600 hover:bg-slate-800 px-6 py-3 rounded-lg font-bold">Login as administrator</Link>
      </div>
    </section>
    <section className="max-w-6xl mx-auto px-6 pb-20 grid md:grid-cols-3 gap-5">
      {[
        [Users, 'Public', 'Submit a category, location, and Before photo.'],
        [Wrench, 'Workers', 'See issues automatically assigned to your service area and add After evidence.'],
        [ShieldCheck, 'MCC', 'Review every complaint and a live AI comparison score.'],
      ].map(([Icon, title, text]: any) => <div key={title} className="bg-slate-900 border border-slate-800 p-6 rounded-xl"><Icon className="text-blue-400 mb-4" /><h2 className="font-bold text-xl">{title}</h2><p className="mt-2 text-slate-400">{text}</p></div>)}
    </section>
  </main>
);
export default Landing;
