
import React from 'react';
import { User, UserRole } from '../types';

interface CommunityProps {
  user: User;
}

const Community: React.FC<CommunityProps> = ({ user }) => {
  const posts = [
    { id: 1, author: 'Tunde Afolayan', avatar: 'https://picsum.photos/seed/12/100/100', content: 'Just finished the Advanced BA course. The Stakeholder Management module is a game changer! Highly recommend for anyone in senior roles.', likes: 24, comments: 5, time: '2h ago' },
    { id: 2, author: 'Chioma Okeke', avatar: 'https://picsum.photos/seed/33/100/100', content: 'Is anyone attending the PM Summit in Lagos next month? P&F has a discount code for members!', likes: 42, comments: 12, time: '5h ago' },
    { id: 3, author: 'Adewale Thompson', avatar: 'https://picsum.photos/seed/55/100/100', content: 'The new SME Scaling toolkit is incredible. Already applying the operational frameworks to my business. 🚀', likes: 18, comments: 3, time: '1d ago' },
  ];

  const webinars = [
    { title: 'Project Management Trends 2025', date: 'Oct 14, 2:00 PM', speaker: 'Dr. Kunle Salami' },
    { title: 'Navigating the IIBA Certification', date: 'Oct 18, 11:00 AM', speaker: 'Amara Nwosu' },
    { title: 'Entrepreneurship in Emerging Markets', date: 'Oct 22, 4:00 PM', speaker: 'Tayo Ayodele' },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="xl:col-span-2 space-y-8">
        {/* Post Box */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <div className="flex gap-4">
             <img src={`https://picsum.photos/seed/${user.id}/80/80`} className="w-12 h-12 rounded-2xl border-2 border-white shadow-md" alt="" />
             <div className="flex-1">
                <textarea 
                  placeholder="Share your learning journey or ask a question..." 
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none resize-none h-24 placeholder-slate-400"
                ></textarea>
                <div className="mt-4 flex justify-between items-center">
                   <div className="flex gap-2">
                      <button className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-blue-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </button>
                      <button className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-blue-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </button>
                   </div>
                   <button className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Post to Feed</button>
                </div>
             </div>
          </div>
        </div>

        {/* Feed */}
        <div className="space-y-6">
          {posts.map(post => (
            <div key={post.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
               <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                     <img src={post.avatar} className="w-12 h-12 rounded-2xl border-2 border-white shadow-md" alt="" />
                     <div>
                        <p className="font-bold text-slate-900 leading-tight mb-1">{post.author}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{post.time}</p>
                     </div>
                  </div>
                  <button className="p-2 text-slate-300 hover:text-slate-600">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM18 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  </button>
               </div>
               <p className="text-slate-600 leading-relaxed mb-8">{post.content}</p>
               <div className="flex gap-8 border-t border-slate-50 pt-6">
                  <button className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-red-500 transition-colors">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                     {post.likes} Likes
                  </button>
                  <button className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-blue-500 transition-colors">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                     {post.comments} Comments
                  </button>
               </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        {/* Webinars Card */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
           <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Live Events</h3>
              <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
           </div>
           <div className="space-y-6">
              {webinars.map((w, i) => (
                <div key={i} className="group cursor-pointer">
                   <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-1">{w.date}</p>
                   <h4 className="font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">{w.title}</h4>
                   <p className="text-xs text-slate-500 mt-1">Host: {w.speaker}</p>
                   {i < webinars.length - 1 && <div className="mt-6 border-b border-slate-50"></div>}
                </div>
              ))}
           </div>
           <button className="w-full mt-10 py-4 bg-slate-50 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100">Browse Calendar</button>
        </div>

        {/* Community Stats */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white overflow-hidden relative group">
           <div className="relative z-10">
              <p className="text-[10px] font-black uppercase text-blue-400 tracking-widest mb-6">Expert Access</p>
              <div className="flex -space-x-3 mb-6">
                 {[1,2,3,4,5].map(i => (
                   <img key={i} src={`https://picsum.photos/seed/face${i}/100/100`} className="w-10 h-10 rounded-full border-2 border-slate-900" alt="" />
                 ))}
                 <div className="w-10 h-10 rounded-full bg-blue-600 border-2 border-slate-900 flex items-center justify-center text-[10px] font-black">+12</div>
              </div>
              <p className="text-sm font-medium text-slate-300 leading-relaxed mb-8">Connect with 120+ Industry Mentors from P&F's Alumni network.</p>
              <button className="w-full py-4 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:-translate-y-1 transition-all">Find a Mentor</button>
           </div>
           <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl group-hover:bg-blue-600/40 transition-all"></div>
        </div>
      </div>
    </div>
  );
};

export default Community;
