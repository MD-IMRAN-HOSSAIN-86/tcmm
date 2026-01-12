
export type MealType = 'breakfast' | 'lunch' | 'dinner';

export interface DailyMealData {
  note: string;
  noteHistory?: string[]; // To store previous versions of the note
  mealStatus: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  };
  guestMeals: {
    breakfast: number;
    lunch: number;
    dinner: number;
  };
}

export interface Member {
  id: string;
  name: string;
  roomNumber: string;
  phone: string;
  password: string;
  isContinuousOn: boolean;
  dailyData: Record<string, DailyMealData>;
  createdAt: number;
}

export interface SummaryStats {
  breakfast: number;
  lunch: number;
  dinner: number;
}
