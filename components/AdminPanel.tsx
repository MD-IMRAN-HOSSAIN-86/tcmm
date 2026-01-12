
import React, { useState, useEffect } from 'react';
import { Member, DailyMealData, MealType, SummaryStats } from '../types';
import { db, createEmptyDailyData } from '../services/mockFirebase';
import { Icons } from '../constants';
import { toISODate } from '../utils/timeUtils';
import SummaryCards from './SummaryCards';

interface AdminPanelProps {
  members: Member[];
  stats: SummaryStats;
}

const AdminNoteEditor = ({ 
  memberId, 
  dateStr, 
  initialNote, 
  history = [] 
}: { 
  memberId: string, 
  dateStr: string, 
  initialNote: string,
  history?: string[]
}) => {
  const [localNote, setLocalNote] = useState(initialNote);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    setLocalNote(initialNote);
  }, [initialNote, dateStr]);

  const handleBlur = () => {
    if (localNote !== initialNote) {
      db.updateNote(memberId, dateStr, localNote);
    }
  };

  return (
    <div className="relative group mt-2 flex flex-col gap-1">
      <div className="flex justify-between items-center px-1">
        <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">বর্তমান নোট</span>
        {history.length > 0 && (
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="text-[9px] bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white px-2 py-0.5 rounded transition-colors font-bold uppercase"
          >
            {showHistory ? 'বন্ধ করুন' : `ইতিহাস (${history.length})`}
          </button>
        )}
      </div>

      {showHistory && (
        <div className="bg-slate-900 border border-slate-700 rounded p-2 mb-2 animate-in slide-in-from-top-1 duration-200">
          <p className="text-[8px] text-emerald-500 font-bold uppercase mb-2 tracking-widest border-b border-slate-800 pb-1">পূর্বের নোটসমূহ:</p>
          <div className="max-h-24 overflow-y-auto space-y-2">
            {history.slice().reverse().map((h, i) => (
              <div key={i} className="text-[10px] text-slate-400 bg-slate-800/50 p-1.5 rounded border-l-2 border-emerald-500/30">
                {h}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="relative">
        <textarea 
          className="w-full bg-slate-900/50 border border-slate-700 rounded p-1.5 text-[11px] text-slate-300 focus:text-emerald-400 focus:border-emerald-500/50 outline-none resize-none scrollbar-thin scrollbar-thumb-slate-800 transition-all min-h-[45px]"
          placeholder="মেম্বার নোট..."
          value={localNote}
          onChange={(e) => setLocalNote(e.target.value)}
          onBlur={handleBlur}
        />
        <div className="absolute right-1 bottom-1 opacity-20 group-hover:opacity-100 transition-opacity pointer-events-none">
           <svg className="w-3 h-3 text-slate-600" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
        </div>
      </div>
    </div>
  );
};

const AdminPanel: React.FC<AdminPanelProps> = ({ members, stats }) => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [selectedDate, setSelectedDate] = useState(toISODate(new Date()));
  const [formData, setFormData] = useState({ name: '', room: '', phone: '', password: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<{id: string, name: string} | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const currentAdminPwd = db.getAdminPassword();
    if (passwordInput.trim() === currentAdminPwd.trim()) {
      setIsAuthorized(true);
    } else {
      alert("ভুল পাসওয়ার্ড! অনুগ্রহ করে আবার চেষ্টা করুন।");
    }
  };

  const handleResetAdminPassword = () => {
    const master = prompt("পাসওয়ার্ড রিসেট করতে মাস্টার পাসওয়ার্ড দিন (TCestablish):");
    if (master === null) return;

    if (master === 'TCestablish') {
      const newPwd = prompt("নতুন অ্যাডমিন পাসওয়ার্ড সেট করুন (কমপক্ষে ৪ অক্ষর):");
      if (newPwd === null) return;

      if (newPwd.trim().length >= 4) {
        db.setAdminPassword(newPwd.trim());
        alert(`অ্যাডমিন পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে!\nনতুন পাসওয়ার্ড: ${newPwd.trim()}`);
        setPasswordInput('');
      } else {
        alert("পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে!");
      }
    } else {
      alert("মাস্টার পাসওয়ার্ড ভুল!");
    }
  };

  const handleResetAllData = async () => {
    const confirmReset = window.confirm("আপনি কি নিশ্চিত যে সকল মেম্বারের মিল ডাটা রিসেট করতে চান?");
    if (confirmReset) {
      const master = prompt("নিশ্চিত করতে মাস্টার পাসওয়ার্ড দিন (TCestablish):");
      if (master === 'TCestablish') {
        await db.resetAllMeals();
        alert("রিসেট সফল হয়েছে।");
      } else if (master !== null) {
        alert("ভুল মাস্টার পাসওয়ার্ড!");
      }
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.room || !formData.phone || !formData.password) return;
    await db.addMember(formData.name, formData.room, formData.phone, formData.password);
    setFormData({ name: '', room: '', phone: '', password: '' });
    setIsAdding(false);
  };

  const handleContinuousToggle = async (id: string, currentStatus: boolean) => {
    await db.updateContinuousStatus(id, !currentStatus);
  };

  const handleToggle = async (memberId: string, meal: MealType, current: boolean) => {
    await db.updateMealStatus(memberId, selectedDate, meal, !current);
  };

  const handleGuest = async (memberId: string, meal: MealType, increment: boolean) => {
    await db.updateGuestMeals(memberId, selectedDate, meal, increment);
  };

  const handleUpdateMemberPassword = async (id: string, newPwd: string) => {
    await db.updateMemberPassword(id, newPwd);
  };

  const confirmDelete = async () => {
    if (memberToDelete) {
      await db.deleteMember(memberToDelete.id);
      setMemberToDelete(null);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <form onSubmit={handleLogin} className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl w-full max-w-sm flex flex-col gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-100">অ্যাডমিন প্যানেল</h2>
            <p className="text-slate-400 text-sm">পাসওয়ার্ড দিয়ে প্রবেশ করুন</p>
          </div>
          
          <input 
            autoFocus 
            type="password" 
            value={passwordInput} 
            onChange={e => setPasswordInput(e.target.value)} 
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none text-center font-mono" 
            placeholder="অ্যাডমিন পাসওয়ার্ড" 
          />

          <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-600/20 active:scale-95">
            প্রবেশ করুন
          </button>
          
          <button 
            type="button" 
            onClick={handleResetAdminPassword} 
            className="text-xs text-slate-500 hover:text-emerald-400 transition-colors uppercase tracking-widest font-bold underline decoration-dotted underline-offset-4"
          >
            পাসওয়ার্ড রিসেট (মাস্টার কী)
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10 relative">
      {memberToDelete && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center px-4">
          <div className="bg-slate-800 border border-slate-700 p-8 rounded-3xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6"><Icons.Delete /></div>
            <h3 className="text-xl font-bold text-slate-100 text-center mb-2">Delete Member?</h3>
            <p className="text-slate-400 text-center mb-8">Are you sure you want to delete <span className="text-rose-400 font-bold">{memberToDelete.name}</span>?</p>
            <div className="flex gap-4">
              <button onClick={() => setMemberToDelete(null)} className="flex-1 bg-slate-700 text-slate-100 font-bold py-3 rounded-xl">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 bg-rose-600 text-white font-bold py-3 rounded-xl">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-100 uppercase tracking-tighter text-center md:text-left">অ্যাডমিন কন্ট্রোল</h2>
          <p className="text-slate-400 text-sm text-center md:text-left">নির্বাচিত তারিখ: <span className="text-emerald-400 font-mono">{selectedDate}</span></p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="bg-slate-700 border border-slate-600 text-slate-100 px-3 py-2 rounded-lg text-xs font-bold outline-none cursor-pointer focus:border-emerald-500" />
          <button onClick={() => setIsAdding(!isAdding)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs transition-all shadow-md active:scale-95">{isAdding ? 'বাতিল' : 'নতুন মেম্বার'}</button>
          <button onClick={handleResetAllData} className="px-4 py-2 bg-rose-600/20 text-rose-500 border border-rose-500/30 hover:bg-rose-600 hover:text-white rounded-lg font-bold text-xs transition-all active:scale-95">সকল মিল রিসেট</button>
        </div>
      </div>

      <SummaryCards stats={stats} />

      {isAdding && (
        <form onSubmit={handleAddMember} className="bg-slate-800 p-6 rounded-2xl border border-emerald-500/30 shadow-xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in slide-in-from-top-4 duration-300">
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 font-bold uppercase ml-1">মেম্বার নাম</label>
            <input required placeholder="নাম" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 font-bold uppercase ml-1">রুম নম্বর</label>
            <input required placeholder="রুম" value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 font-bold uppercase ml-1">ফোন নম্বর</label>
            <input required placeholder="ফোন" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 font-bold uppercase ml-1">পাসওয়ার্ড</label>
            <input required type="password" placeholder="পাসওয়ার্ড" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500" />
          </div>
          <button type="submit" className="md:col-span-full bg-emerald-600 hover:bg-emerald-500 py-3 rounded-lg font-bold text-white uppercase text-xs tracking-widest transition-all active:scale-[0.98]">মেম্বার যোগ করুন</button>
        </form>
      )}

      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-slate-700/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="px-4 py-4">নাম ও মাস্টার সুইচ</th>
                <th className="px-4 py-4 text-center">সকাল</th>
                <th className="px-4 py-4 text-center">দুপুর</th>
                <th className="px-4 py-4 text-center">রাত</th>
                <th className="px-4 py-4">মেম্বার পাসওয়ার্ড</th>
                <th className="px-4 py-4 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {members.map(member => {
                const day = member.dailyData[selectedDate] || createEmptyDailyData();
                return (
                  <tr key={member.id} className={`hover:bg-slate-700/10 transition-colors ${!member.isContinuousOn ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-4 w-[340px]">
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col items-center shrink-0 mt-1">
                          <button 
                            onClick={() => handleContinuousToggle(member.id, member.isContinuousOn)}
                            className={`w-10 h-5 rounded-full relative transition-colors ${member.isContinuousOn ? 'bg-emerald-500' : 'bg-slate-600'}`}
                          >
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${member.isContinuousOn ? 'left-6' : 'left-1'}`}></div>
                          </button>
                          <span className={`text-[8px] font-bold mt-1 uppercase ${member.isContinuousOn ? 'text-emerald-500' : 'text-slate-500'}`}>
                            {member.isContinuousOn ? 'Cont. ON' : 'Cont. OFF'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-slate-100 text-sm flex items-center gap-2 truncate">
                            {member.name}
                          </div>
                          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">রুম: {member.roomNumber}</div>
                          <AdminNoteEditor 
                            memberId={member.id} 
                            dateStr={selectedDate} 
                            initialNote={day.note} 
                            history={day.noteHistory}
                          />
                        </div>
                      </div>
                    </td>
                    {(['breakfast', 'lunch', 'dinner'] as MealType[]).map(meal => (
                      <td key={meal} className="px-4 py-4 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <button 
                            disabled={!member.isContinuousOn}
                            onClick={() => handleToggle(member.id, meal, day.mealStatus[meal])}
                            className={`w-12 py-1 rounded font-bold text-[10px] transition-all ${!member.isContinuousOn ? 'bg-slate-700 text-slate-500' : (day.mealStatus[meal] ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white')}`}
                          >
                            {day.mealStatus[meal] ? 'ON' : 'OFF'}
                          </button>
                          <div className="flex items-center gap-2">
                            <button disabled={!member.isContinuousOn} onClick={() => handleGuest(member.id, meal, false)} className="text-slate-500 hover:text-emerald-400"><Icons.Minus /></button>
                            <span className="text-[10px] font-mono text-slate-300 font-bold">+{day.guestMeals[meal]}</span>
                            <button disabled={!member.isContinuousOn} onClick={() => handleGuest(member.id, meal, true)} className="text-slate-500 hover:text-emerald-400"><Icons.Plus /></button>
                          </div>
                        </div>
                      </td>
                    ))}
                    <td className="px-4 py-4">
                      <div className="relative group/pass">
                        <input 
                          type="password" 
                          className="bg-slate-900 border border-slate-700 text-[11px] p-1.5 rounded w-24 text-emerald-400 font-mono text-center outline-none focus:border-emerald-500 focus:bg-slate-950 transition-all" 
                          value={member.password} 
                          onChange={(e) => handleUpdateMemberPassword(member.id, e.target.value)} 
                        />
                        <div className="absolute -top-3 left-0 right-0 text-center opacity-0 group-hover/pass:opacity-100 transition-opacity">
                           <span className="text-[8px] text-slate-500 font-bold uppercase">পাসওয়ার্ড এডিট</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button onClick={() => setMemberToDelete({id: member.id, name: member.name})} className="p-2 text-rose-500/30 hover:text-rose-500 transition-colors">
                        <Icons.Delete />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
