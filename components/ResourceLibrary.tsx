
import React, { useState } from 'react';
import { User, Resource, MembershipTier } from '../types';

interface ResourceLibraryProps {
  user: User;
}

const MOCK_RESOURCES: (Resource & { tier: MembershipTier, category: string })[] = [
  { id: 'r1', title: 'PMP® Exam Cheat Sheet 2024', type: 'Toolkit', downloadUrl: '#', tier: MembershipTier.BASIC, category: 'PM' },
  { id: 'r2', title: 'Business Case Template (Executive)', type: 'Template', downloadUrl: '#', tier: MembershipTier.PRO, category: 'BA' },
  { id: 'r3', title: 'Nigeria Tech Market Analysis Q3', type: 'Report', downloadUrl: '#', tier: MembershipTier.ELITE, category: 'Strategy' },
  { id: 'r4', title: 'Agile Ceremonies Checklist', type: 'Toolkit', downloadUrl: '#', tier: MembershipTier.BASIC, category: 'Agile' },
  { id: 'r5', title: 'Stakeholder Matrix (Advanced)', type: 'Template', downloadUrl: '#', tier: MembershipTier.PRO, category: 'Leadership' },
  { id: 'r6', title: 'SME Business Plan Template', type: 'Template', downloadUrl: '#', tier: MembershipTier.ELITE, category: 'SME' },
];

const ResourceLibrary: React.FC<ResourceLibraryProps> = ({ user }) => {
  const [search, setSearch] = useState('');

  const isLocked = (resourceTier: MembershipTier) => {
    const tiers = [MembershipTier.BASIC, MembershipTier.PRO, MembershipTier.ELITE];
    return tiers.indexOf(resourceTier) > tiers.indexOf(user.tier);
  };

  const filtered = MOCK_RESOURCES.filter(r => 
    r.title.toLowerCase().includes(search.toLowerCase()) || 
    r.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-xl">
            <h2 className="text-4xl font-black tracking-tight mb-4 leading-tight">Global Knowledge Repository</h2>
            <p className="text-slate-400 text-lg font-medium">Proprietary toolkits and industry benchmarks curated by P&F Experts.</p>
          </div>
          <div className="relative w-full md:w-80">
            <input 
              type="text" 
              placeholder="Search assets..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-blue-600/20 to-transparent"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(res => {
          const locked = isLocked(res.tier);
          return (
            <div key={res.id} className={`p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col group transition-all hover:shadow-xl hover:-translate-y-1 ${locked ? 'opacity-80' : ''}`}>
              <div className="flex justify-between items-start mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  res.type === 'Toolkit' ? 'bg-blue-50 text-blue-600' :
                  res.type === 'Template' ? 'bg-indigo-50 text-indigo-600' :
                  'bg-emerald-50 text-emerald-600'
                }`}>
                  {res.type === 'Toolkit' && <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                  {res.type === 'Template' && <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>}
                  {res.type === 'Report' && <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                </div>
                {locked ? (
                  <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-3 py-1.5 rounded-xl flex items-center gap-1 uppercase tracking-widest">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                    Locked
                  </span>
                ) : (
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{res.category}</span>
                )}
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight mb-8 group-hover:text-blue-600 transition-colors">{res.title}</h3>
              <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{res.type}</span>
                {locked ? (
                  <button className="text-[10px] font-black text-amber-600 uppercase tracking-widest hover:underline">View Tiers</button>
                ) : (
                  <button className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">
                    Download
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResourceLibrary;
