
import React, { useState } from 'react';
import { User, Course, MembershipTier, UserRole } from '../types';

interface LearningHubProps {
  user: User;
}

const MOCK_COURSES: Course[] = [
  { id: 'c1', title: 'PMP® Certification Masterclass', category: 'Project Management', progress: 78, thumbnail: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?auto=format&fit=crop&q=80&w=400', tierRequired: MembershipTier.BASIC, segments: [UserRole.PROFESSIONAL, UserRole.JOB_SEEKER] },
  { id: 'c2', title: 'Advanced Business Analysis (IIBA)', category: 'Business Analysis', progress: 42, thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400', tierRequired: MembershipTier.PRO, segments: [UserRole.PROFESSIONAL] },
  { id: 'c3', title: 'SME Scaling & Operational Excellence', category: 'Entrepreneurship', progress: 0, thumbnail: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&q=80&w=400', tierRequired: MembershipTier.ELITE, segments: [UserRole.SME_OWNER] },
  { id: 'c4', title: 'Agile & Scrum Fundamentals', category: 'Agile', progress: 100, thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=400', tierRequired: MembershipTier.BASIC, segments: [UserRole.PROFESSIONAL, UserRole.JOB_SEEKER] },
  { id: 'c5', title: 'Strategic Leadership for Executives', category: 'Leadership', progress: 15, thumbnail: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400', tierRequired: MembershipTier.ELITE, segments: [UserRole.CORPORATE_ADMIN, UserRole.PROFESSIONAL] },
  { id: 'c6', title: 'Digital Transformation Blueprint', category: 'Tech', progress: 0, thumbnail: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=400', tierRequired: MembershipTier.PRO, segments: [UserRole.SME_OWNER, UserRole.CORPORATE_ADMIN] },
];

const LearningHub: React.FC<LearningHubProps> = ({ user }) => {
  const [filter, setFilter] = useState('All');
  const categories = ['All', ...Array.from(new Set(MOCK_COURSES.map(c => c.category)))];

  const filteredCourses = MOCK_COURSES.filter(c => 
    filter === 'All' || c.category === filter
  );

  const isLocked = (courseTier: MembershipTier) => {
    const tiers = [MembershipTier.BASIC, MembershipTier.PRO, MembershipTier.ELITE];
    return tiers.indexOf(courseTier) > tiers.indexOf(user.tier);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Curriculum Hub</h2>
          <p className="text-slate-500 font-medium">Personalized training tracks for your {user.role.replace('_', ' ')} journey.</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                filter === cat ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredCourses.map(course => {
          const locked = isLocked(course.tierRequired);
          return (
            <div key={course.id} className={`group relative bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col ${locked ? 'opacity-75' : ''}`}>
              <div className="relative h-52 overflow-hidden">
                <img src={course.thumbnail} alt={course.title} className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${locked ? 'grayscale' : ''}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-lg border border-white/20">
                    {course.category}
                  </span>
                  {locked && (
                    <span className="px-3 py-1 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                      {course.tierRequired} ONLY
                    </span>
                  )}
                </div>
              </div>

              <div className="p-8 flex-1 flex flex-col">
                <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight mb-4">{course.title}</h3>
                <div className="mt-auto">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Progress</span>
                    <span className="text-xs font-black text-blue-600">{course.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-8">
                    <div className="bg-blue-600 h-full rounded-full transition-all duration-1000" style={{ width: `${course.progress}%` }} />
                  </div>
                  
                  {locked ? (
                    <button className="w-full py-4 bg-slate-100 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest cursor-not-allowed">Upgrade to Access</button>
                  ) : (
                    <button className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200">
                      {course.progress === 0 ? 'Start Learning' : course.progress === 100 ? 'Review Course' : 'Resume Track'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LearningHub;
