
import React from 'react';
import { Member } from '../types';
import MemberRow from './MemberRow';
import { getFormattedDate, toISODate } from '../utils/timeUtils';

interface DashboardProps {
  members: Member[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ members, selectedDate, setSelectedDate }) => {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-xl">
        <div className="text-center md:text-left">
          <h2 className="text-lg font-bold text-slate-100 uppercase tracking-tighter">মিলের তারিখ:</h2>
          <p className="text-emerald-400 font-medium">{getFormattedDate(new Date(selectedDate))}</p>
        </div>
        <div className="flex gap-2">
           <button 
            onClick={() => setSelectedDate(toISODate(new Date()))}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${selectedDate === toISODate(new Date()) ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-700 text-slate-400 hover:text-slate-100'}`}
          >
            আজকের তারিখ
          </button>
          <input 
            type="date" 
            value={selectedDate}
            onChange={handleDateChange}
            className="bg-slate-700 border border-slate-600 text-slate-100 px-3 py-2 rounded-lg text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center px-4 sm:px-0">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            মেম্বার তালিকা
            <span className="bg-slate-700 text-slate-400 text-xs px-2 py-0.5 rounded-full">{members.length}</span>
          </h2>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">খাবে</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">বন্ধ</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {members.map((member) => (
            <MemberRow key={member.id} member={member} dateStr={selectedDate} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
