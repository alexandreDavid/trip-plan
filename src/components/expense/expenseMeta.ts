import { Ionicons } from '@expo/vector-icons';
import { ExpenseCategory } from '@/types';
import { colors } from '@/theme';

type IconName = keyof typeof Ionicons.glyphMap;

export const expenseCategoryMeta: Record<
  ExpenseCategory,
  { icon: IconName; color: string; label: string }
> = {
  [ExpenseCategory.ACCOMMODATION]: { icon: 'bed-outline', color: colors.accommodation, label: 'Hébergement' },
  [ExpenseCategory.TRANSPORT]: { icon: 'airplane-outline', color: colors.transport, label: 'Transport' },
  [ExpenseCategory.FOOD]: { icon: 'restaurant-outline', color: colors.restaurant, label: 'Repas' },
  [ExpenseCategory.ACTIVITY]: { icon: 'map-outline', color: colors.activity, label: 'Activité' },
  [ExpenseCategory.SHOPPING]: { icon: 'bag-outline', color: colors.warning, label: 'Achats' },
  [ExpenseCategory.OTHER]: { icon: 'pricetag-outline', color: colors.secondary, label: 'Autre' },
};

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  ExpenseCategory.FOOD,
  ExpenseCategory.ACCOMMODATION,
  ExpenseCategory.TRANSPORT,
  ExpenseCategory.ACTIVITY,
  ExpenseCategory.SHOPPING,
  ExpenseCategory.OTHER,
];
