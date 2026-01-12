
import React, { useState } from 'react';
import { Member, DailyMealData } from '../types';
import { db, createEmptyDailyData } from '../services/mockFirebase';
import { Icons } from '../constants';

interface MemberRowProps {
  member: Member;
  dateStr: string;
}

const MemberRow: React.FC<MemberRowProps> = ({ member, dateStr }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [noteValue, setNoteValue] = useState('');

  const dayData: DailyMealData = member.dailyData[dateStr] || createEmptyDailyData();

  const handleStartVerifying = () => {
    setIsVerifying(true);
    setPasswordInput('');
  };

  const handleVerifyPassword = () => {
    if (passwordInput === member.password) {
      setNoteValue(dayData.note);
      setIsVerifying(false);
      setIsEditing(true);
    } else {
      alert("ভুল পাসওয়ার্ড!");
      setPasswordInput('');
    }
  };

  const handleSaveNote = async () => {
    await db.updateNote(member.id, dateStr, noteValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  const StatusBadge = ({ type, isOn }: { type: string, isOn: boolean }) => {
    const effectiveOn = member.isContinuousOn && isOn;
    return (
      <div className={`flex flex-col items-center justify-center px-3 py-1 rounded-lg border transition-all ${effectiveOn ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'}`}>
        <span className={`text-[10px] font-bold ${effectiveOn ? 'text-emerald-400' : 'text-rose-400'}`}>{type}</span>
        <span className={`text-[9px] font-black uppercase ${effectiveOn ? 'text-emerald-500' : 'text-rose-500'}`}>
          {effectiveOn ? 'ON' : 'OFF'}
        </span>
      </div>
    );
  };

  return (
    <div className={`bg-slate-800 rounded-2xl p-4 border border-slate-700 shadow-sm flex flex-col gap-4 group transition-all duration-300 ${!member.isContinuousOn ? 'border-rose-500/10 grayscale-[0.5] opacity-80' : 'hover:border-emerald-500/30'}`}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border shrink-0 transition-colors ${member.isContinuousOn ? 'bg-slate-700 text-emerald-400 border-slate-600' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
            <Icons.User />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-100 truncate text-base flex items-center gap-2">
              {member.name}
              {!member.isContinuousOn && <span className="text-[9px] bg-rose-500 text-white px-1.5 py-0.5 rounded-full uppercase tracking-tighter">OFF</span>}
            </h3>
            <p className="text-xs text-slate-500 font-medium">রুম: {member.roomNumber}</p>
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto justify-center">
          <StatusBadge type="সকাল" isOn={dayData.mealStatus.breakfast} />
          <StatusBadge type="দুপুর" isOn={dayData.mealStatus.lunch} />
          <StatusBadge type="রাত" isOn={dayData.mealStatus.dinner} />
        </div>
      </div>

      <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/50">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">নোট বক্স</span>
          {!isVerifying && !isEditing && (
            <button onClick={handleStartVerifying} className="text-[10px] bg-emerald-600/20 text-emerald-400 px-3 py-1 rounded border border-emerald-500/30 hover:bg-emerald-600 hover:text-white transition-all font-bold">লিখুন</button>
          )}
        </div>
        
        {isVerifying && (
          <div className="flex gap-2 mt-2">
            <input autoFocus type="password" placeholder="পাসওয়ার্ড দিন..." value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} onKeyDown={(e) => handleKeyDown(e, handleVerifyPassword)} className="flex-1 bg-slate-800 border border-emerald-500/30 rounded-lg px-3 py-1.5 text-xs text-emerald-400 outline-none" />
            <button onClick={handleVerifyPassword} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold">OK</button>
            <button onClick={() => setIsVerifying(false)} className="px-3 py-1.5 bg-slate-700 text-slate-300 rounded-lg text-xs font-bold">X</button>
          </div>
        )}

        {isEditing && (
          <div className="flex gap-2 mt-2">
            <input autoFocus type="text" placeholder="নোট লিখুন..." value={noteValue} onChange={(e) => setNoteValue(e.target.value)} onKeyDown={(e) => handleKeyDown(e, handleSaveNote)} className="flex-1 bg-slate-800 border border-emerald-500/50 rounded-lg px-3 py-1.5 text-sm text-slate-100 outline-none" />
            <div className="flex gap-1">
              <button onClick={handleSaveNote} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold">Save</button>
              <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 bg-slate-700 text-slate-300 rounded-lg text-xs font-bold">X</button>
            </div>
          </div>
        )}

        {!isVerifying && !isEditing && (
          <div className="max-h-20 overflow-y-auto min-h-[1.2rem]">
            <p className="text-sm text-slate-300 break-words leading-relaxed">{dayData.note || <span className="text-slate-700 italic text-[11px]">কোনো নোট নেই...</span>}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberRow;
