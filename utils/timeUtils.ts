
export const getFormattedDate = (date: Date = new Date()): string => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

export const getFormattedTime = (): string => {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).format(new Date());
};

export const toISODate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const isToday = (dateStr: string): boolean => {
  return dateStr === toISODate(new Date());
};

export const isPast = (dateStr: string): boolean => {
  return dateStr < toISODate(new Date());
};

export const isFuture = (dateStr: string): boolean => {
  return dateStr > toISODate(new Date());
};

/**
 * Restrictions removed as requested: 
 * "মিল অফ অনের কোনো সময় নির্দিষ্ট থাকবে না"
 */
export const canToggleMeal = (dateStr: string): boolean => {
  return true; 
};

export const canAddGuestMeal = (dateStr: string, type: 'breakfast' | 'lunch' | 'dinner'): boolean => {
  return true;
};
