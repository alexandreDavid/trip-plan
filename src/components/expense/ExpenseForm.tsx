import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Expense, ExpenseInput, ExpenseCategory, Participant } from '@/types';
import { CURRENCIES } from '@/config/constants';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { colors, radius, spacing, fontSize } from '@/theme';
import { formatDate } from '@/utils/dates';
import { expenseCategoryMeta, EXPENSE_CATEGORIES } from './expenseMeta';

interface Props {
  participants: Participant[];
  baseCurrency: string;
  currentUid?: string;
  initialExpense?: Expense;
  submitting?: boolean;
  onSubmit: (input: ExpenseInput) => void;
}

const parseNum = (s: string): number => parseFloat(s.replace(',', '.'));

const todayKey = (): string => formatDate(new Date(), 'yyyy-MM-dd');

export function ExpenseForm({
  participants,
  baseCurrency,
  currentUid,
  initialExpense,
  submitting,
  onSubmit,
}: Props) {
  const defaultPayer =
    initialExpense?.paidBy ??
    participants.find((p) => p.uid === currentUid)?.id ??
    participants[0]?.id ??
    '';

  const [label, setLabel] = useState(initialExpense?.label ?? '');
  const [amount, setAmount] = useState(initialExpense ? String(initialExpense.amount) : '');
  const [currency, setCurrency] = useState(initialExpense?.currency ?? baseCurrency);
  const [rate, setRate] = useState(initialExpense ? String(initialExpense.rate) : '1');
  const [category, setCategory] = useState<ExpenseCategory>(
    initialExpense?.category ?? ExpenseCategory.FOOD,
  );
  const [paidBy, setPaidBy] = useState(defaultPayer);
  const [splitBetween, setSplitBetween] = useState<string[]>(
    initialExpense?.splitBetween ?? participants.map((p) => p.id),
  );
  const [dateInput, setDateInput] = useState(
    initialExpense ? formatDate(initialExpense.date, 'yyyy-MM-dd') : todayKey(),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isForeign = currency !== baseCurrency;

  const perPersonPreview = useMemo(() => {
    const a = parseNum(amount);
    const r = isForeign ? parseNum(rate) : 1;
    if (!a || !r || splitBetween.length === 0) return null;
    return (a * r) / splitBetween.length;
  }, [amount, rate, isForeign, splitBetween.length]);

  const toggleSplit = (id: string) => {
    setSplitBetween((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const parseDate = (s: string): Date | undefined => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return undefined;
    const d = new Date(s + 'T00:00:00');
    return isNaN(d.getTime()) ? undefined : d;
  };

  const handleSubmit = () => {
    const errs: Record<string, string> = {};
    const amountNum = parseNum(amount);
    const rateNum = isForeign ? parseNum(rate) : 1;
    const date = parseDate(dateInput);

    if (!label.trim()) errs.label = 'Le libellé est requis';
    if (!amountNum || amountNum <= 0) errs.amount = 'Montant invalide';
    if (isForeign && (!rateNum || rateNum <= 0)) errs.rate = 'Taux invalide';
    if (!paidBy) errs.paidBy = 'Choisissez qui a payé';
    if (splitBetween.length === 0) errs.split = 'Au moins un participant';
    if (!date) errs.date = 'Date invalide (AAAA-MM-JJ)';

    setErrors(errs);
    if (Object.keys(errs).length > 0 || !date) return;

    onSubmit({
      label: label.trim(),
      amount: amountNum,
      currency,
      rate: rateNum,
      amountInBase: amountNum * rateNum,
      paidBy,
      splitMode: 'equal',
      splitBetween,
      category,
      date,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Input label="Libellé *" value={label} onChangeText={setLabel} error={errors.label} placeholder="Dîner, taxi, musée…" />

      <View style={styles.amountRow}>
        <View style={{ flex: 1 }}>
          <Input
            label="Montant *"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="0"
            error={errors.amount}
          />
        </View>
      </View>

      <Text style={styles.fieldLabel}>Devise</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        {CURRENCIES.map((c) => (
          <Chip key={c} label={c} active={c === currency} onPress={() => setCurrency(c)} />
        ))}
      </ScrollView>

      {isForeign && (
        <Input
          label={`Taux (1 ${currency} = ? ${baseCurrency}) *`}
          value={rate}
          onChangeText={setRate}
          keyboardType="decimal-pad"
          error={errors.rate}
        />
      )}

      <Text style={styles.fieldLabel}>Catégorie</Text>
      <View style={styles.catGrid}>
        {EXPENSE_CATEGORIES.map((cat) => {
          const meta = expenseCategoryMeta[cat];
          const active = cat === category;
          return (
            <Pressable
              key={cat}
              onPress={() => setCategory(cat)}
              style={[styles.catChip, active && { borderColor: meta.color, backgroundColor: meta.color + '18' }]}
            >
              <Ionicons name={meta.icon} size={16} color={active ? meta.color : colors.textMuted} />
              <Text style={[styles.catText, active && { color: meta.color, fontWeight: '700' }]}>
                {meta.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.fieldLabel}>Payé par *</Text>
      {errors.paidBy && <Text style={styles.errorText}>{errors.paidBy}</Text>}
      <View style={styles.catGrid}>
        {participants.map((p) => (
          <Chip key={p.id} label={p.displayName} active={p.id === paidBy} onPress={() => setPaidBy(p.id)} />
        ))}
      </View>

      <Text style={styles.fieldLabel}>Partagé entre *</Text>
      {errors.split && <Text style={styles.errorText}>{errors.split}</Text>}
      <View style={styles.catGrid}>
        {participants.map((p) => (
          <Chip
            key={p.id}
            label={p.displayName}
            active={splitBetween.includes(p.id)}
            onPress={() => toggleSplit(p.id)}
          />
        ))}
      </View>

      {perPersonPreview != null && (
        <Text style={styles.preview}>
          Soit {perPersonPreview.toFixed(2)} {baseCurrency} par personne
        </Text>
      )}

      <Input
        label="Date *"
        value={dateInput}
        onChangeText={setDateInput}
        placeholder="2026-06-15"
        error={errors.date}
      />

      <Button
        title={initialExpense ? 'Enregistrer' : 'Ajouter la dépense'}
        onPress={handleSubmit}
        loading={submitting}
        style={{ marginTop: spacing.sm }}
      />
    </ScrollView>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md, paddingBottom: spacing.xl },
  amountRow: { flexDirection: 'row', gap: spacing.sm },
  fieldLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  chipScroll: { marginBottom: spacing.md },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    borderWidth: 1,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  chipInactive: { borderColor: colors.border, backgroundColor: colors.surface },
  chipText: { fontSize: fontSize.sm, color: colors.text },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.md },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  catText: { fontSize: fontSize.sm, color: colors.textMuted },
  preview: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.md,
    fontStyle: 'italic',
  },
  errorText: { color: colors.danger, fontSize: fontSize.xs, marginBottom: spacing.xs },
});
