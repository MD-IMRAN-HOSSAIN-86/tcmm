
import { Member, MealType, DailyMealData } from '../types';
import { toISODate } from '../utils/timeUtils';

const STORAGE_KEY = 'tasmis_cottage_members_v3';
const ADMIN_PWD_KEY = 'tasmis_admin_pwd';

export const createEmptyDailyData = (): DailyMealData => ({
  note: '',
  noteHistory: [],
  mealStatus: { breakfast: true, lunch: true, dinner: true },
  guestMeals: { breakfast: 0, lunch: 0, dinner: 0 }
});

class MockFirebaseService {
  private members: Member[] = [];
  private listeners: Set<(members: Member[]) => void> = new Set();

  constructor() {
    this.load();
  }

  private load() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      this.members = JSON.parse(data);
      this.pruneOldData();
    } else {
      const today = toISODate(new Date());
      this.members = [
        {
          id: '1',
          name: 'Abu Tasmis',
          roomNumber: '201',
          phone: '01700000001',
          password: '123',
          isContinuousOn: true,
          dailyData: { [today]: createEmptyDailyData() },
          createdAt: Date.now()
        }
      ];
      this.save();
    }

    if (!localStorage.getItem(ADMIN_PWD_KEY)) {
      localStorage.setItem(ADMIN_PWD_KEY, '123456');
    }
  }

  private pruneOldData() {
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const thresholdDate = toISODate(sixtyDaysAgo);

    let changed = false;
    this.members = this.members.map(member => {
      const cleanedDailyData: Record<string, DailyMealData> = {};
      let memberDataChanged = false;

      Object.keys(member.dailyData).forEach(dateKey => {
        if (dateKey >= thresholdDate) {
          cleanedDailyData[dateKey] = member.dailyData[dateKey];
        } else {
          memberDataChanged = true;
          changed = true;
        }
      });

      return memberDataChanged ? { ...member, dailyData: cleanedDailyData } : member;
    });

    if (changed) {
      this.save();
    }
  }

  private save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.members));
    this.notify();
  }

  private notify() {
    this.listeners.forEach(listener => listener([...this.members]));
  }

  public onSnapshot(callback: (members: Member[]) => void) {
    this.listeners.add(callback);
    callback([...this.members]);
    return () => this.listeners.delete(callback);
  }

  public getAdminPassword(): string {
    return localStorage.getItem(ADMIN_PWD_KEY) || '123456';
  }

  public setAdminPassword(newPwd: string) {
    localStorage.setItem(ADMIN_PWD_KEY, newPwd);
  }

  public async addMember(name: string, roomNumber: string, phone: string, password: string) {
    const newMember: Member = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      roomNumber,
      phone,
      password,
      isContinuousOn: true,
      dailyData: {},
      createdAt: Date.now()
    };
    this.members.push(newMember);
    this.save();
  }

  public async deleteMember(id: string) {
    this.members = this.members.filter(m => m.id !== id);
    this.save();
  }

  public async updateContinuousStatus(id: string, status: boolean) {
    this.members = this.members.map(m => m.id === id ? { ...m, isContinuousOn: status } : m);
    this.save();
  }

  public async updateMemberPassword(id: string, password: string) {
    this.members = this.members.map(m => m.id === id ? { ...m, password } : m);
    this.save();
  }

  public async updateMealStatus(memberId: string, dateStr: string, meal: MealType, status: boolean) {
    this.members = this.members.map(m => {
      if (m.id === memberId) {
        const dayData = m.dailyData[dateStr] || createEmptyDailyData();
        return {
          ...m,
          dailyData: {
            ...m.dailyData,
            [dateStr]: {
              ...dayData,
              mealStatus: { ...dayData.mealStatus, [meal]: status }
            }
          }
        };
      }
      return m;
    });
    this.save();
  }

  public async updateNote(memberId: string, dateStr: string, note: string) {
    this.members = this.members.map(m => {
      if (m.id === memberId) {
        const updatedDailyData = { ...m.dailyData };
        const dayData = updatedDailyData[dateStr] || createEmptyDailyData();
        
        // Log history only if the current note exists and is being changed to something new
        const history = dayData.noteHistory || [];
        if (dayData.note && dayData.note !== note && !history.includes(dayData.note)) {
          history.push(dayData.note);
        }

        updatedDailyData[dateStr] = {
          ...dayData,
          note: note,
          noteHistory: history
        };
        return { ...m, dailyData: updatedDailyData };
      }
      return m;
    });
    this.save();
  }

  public async updateGuestMeals(memberId: string, dateStr: string, meal: MealType, increment: boolean) {
    this.members = this.members.map(m => {
      if (m.id === memberId) {
        const dayData = m.dailyData[dateStr] || createEmptyDailyData();
        const currentCount = dayData.guestMeals[meal];
        const newCount = increment ? currentCount + 1 : Math.max(0, currentCount - 1);
        
        return {
          ...m,
          dailyData: {
            ...m.dailyData,
            [dateStr]: {
              ...dayData,
              guestMeals: { ...dayData.guestMeals, [meal]: newCount }
            }
          }
        };
      }
      return m;
    });
    this.save();
  }

  public async resetAllMeals() {
    this.members = this.members.map(m => ({ ...m, dailyData: {} }));
    this.save();
  }
}

export const db = new MockFirebaseService();
