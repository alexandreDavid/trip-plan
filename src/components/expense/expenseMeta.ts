import { Ionicons } from '@expo/vector-icons';
import { ExpenseCategory } from '@/types';
import { accent } from '@/theme';

type IconName = keyof typeof Ionicons.glyphMap;

// Le label est une clé i18n (résolue à l'affichage via t()).
export const expenseCategoryMeta: Record<
  ExpenseCategory,
  { icon: IconName; color: string; labelKey: string }
> = {
  [ExpenseCategory.ACCOMMODATION]: { icon: 'bed-outline', color: accent.accommodation, labelKey: 'expense.category.accommodation' },
  [ExpenseCategory.TRANSPORT]: { icon: 'airplane-outline', color: accent.transport, labelKey: 'expense.category.transport' },
  [ExpenseCategory.FOOD]: { icon: 'restaurant-outline', color: accent.restaurant, labelKey: 'expense.category.food' },
  [ExpenseCategory.ACTIVITY]: { icon: 'map-outline', color: accent.activity, labelKey: 'expense.category.activity' },
  [ExpenseCategory.SHOPPING]: { icon: 'bag-outline', color: accent.warning, labelKey: 'expense.category.shopping' },
  [ExpenseCategory.OTHER]: { icon: 'pricetag-outline', color: accent.secondary, labelKey: 'expense.category.other' },
};

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  ExpenseCategory.FOOD,
  ExpenseCategory.ACCOMMODATION,
  ExpenseCategory.TRANSPORT,
  ExpenseCategory.ACTIVITY,
  ExpenseCategory.SHOPPING,
  ExpenseCategory.OTHER,
];
