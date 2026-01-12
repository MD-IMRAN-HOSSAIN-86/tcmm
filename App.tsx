
import React, { useState, useEffect, useMemo } from 'react';
import { Member, SummaryStats, DailyMealData } from './types';
import { db } from './services/mockFirebase';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import { toISODate } from './utils/timeUtils';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'admin'>('dashboard');
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(toISODate(new Date()));

  useEffect(() => {
    const unsubscribe = db.onSnapshot((updatedMembers) => {
      setMembers(updatedMembers);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const stats = useMemo(() => {
    const mealTotals = { breakfast: 0, lunch: 0, dinner: 0 };
    
    members.forEach(member => {
      // If member is Master OFF (Continuous OFF), they count 0 for all meals
      if (!member.isContinuousOn) {
        // Even if they have guest meals, they are usually only for active members, 
        // but we'll count guest meals if they were added manually before deactivation.
        const day = member.dailyData[selectedDate];
        if (day) {
          mealTotals.breakfast += day.guestMeals.breakfast;
          mealTotals.lunch += day.guestMeals.lunch;
          mealTotals.dinner += day.guestMeals.dinner;
        }
        return;
      }

      const day = member.dailyData[selectedDate];
      if (day) {
        if (day.mealStatus.breakfast) mealTotals.breakfast += (1 + day.guestMeals.breakfast);
        else mealTotals.breakfast += day.guestMeals.breakfast;

        if (day.mealStatus.lunch) mealTotals.lunch += (1 + day.guestMeals.lunch);
        else mealTotals.lunch += day.guestMeals.lunch;

        if (day.mealStatus.dinner) mealTotals.dinner += (1 + day.guestMeals.dinner);
        else mealTotals.dinner += day.guestMeals.dinner;
      } else {
        // Default to ON if no daily data exists yet for an active member
        mealTotals.breakfast += 1;
        mealTotals.lunch += 1;
        mealTotals.dinner += 1;
      }
    });

    return mealTotals;
  }, [members, selectedDate]);

  return (
    <div className="min-h-screen bg-slate-900 pb-20 text-slate-100">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex bg-slate-800 p-1 rounded-xl mb-10 w-full sm:w-fit mx-auto border border-slate-700 shadow-xl">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 sm:flex-none px-8 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'dashboard' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex-1 sm:flex-none px-8 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'admin' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Admin Panel
          </button>
        </div>

        {activeTab === 'dashboard' ? (
          <Dashboard 
            members={members} 
            selectedDate={selectedDate} 
            setSelectedDate={setSelectedDate} 
          />
        ) : (
          <AdminPanel members={members} stats={stats} />
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900/80 backdrop-blur-md border-t border-slate-800 z-40">
        <div className="max-w-6xl mx-auto flex justify-center items-center text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">
          <span>TASMIA COTTAGE</span>
        </div>
      </div>
    </div>
  );
};

export default App;
