import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  Expense,
  ExpenseInput,
  ExpenseCategory,
  Participant,
  SplitMode,
  TripEvent,
} from '@/types';
import { CURRENCIES } from '@/config/constants';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Palette, radius, spacing, fontSize } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useT } from '@/i18n/I18nContext';
import { formatDate } from '@/utils/dates';
import { amountsSplitDiff } from '@/utils/expenses';
import { expenseCategoryMeta, EXPENSE_CATEGORIES } from './expenseMeta';

interface Props {
  participants: Participant[];
  events: TripEvent[];
  baseCurrency: string;
  currentUid?: string;
  initialExpense?: Expense;
  submitting?: boolean;
  onSubmit: (input: ExpenseInput) => void;
}

const parseNum = (s: string): number => parseFloat(s.replace(',', '.'));

const todayKey = (): string => formatDate(new Date(), 'yyyy-MM-dd');

const SPLIT_MODES: { mode: SplitMode; labelKey: string }[] = [
  { mode: 'equal', labelKey: 'expense.splitEqual' },
  { mode: 'shares', labelKey: 'expense.splitShares' },
  { mode: 'amounts', labelKey: 'expense.splitAmounts' },
];

export function ExpenseForm({
  participants,
  events,
  baseCurrency,
  currentUid,
  initialExpense,
  submitting,
  onSubmit,
}: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const t = useT();

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
  const [splitMode, setSplitMode] = useState<SplitMode>(initialExpense?.splitMode ?? 'equal');
  const [splitBetween, setSplitBetween] = useState<string[]>(
    initialExpense?.splitBetween ?? participants.map((p) => p.id),
  );
  const [shareInputs, setShareInputs] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    if (initialExpense?.shares) {
      for (const [id, v] of Object.entries(initialExpense.shares)) init[id] = String(v);
    }
    return init;
  });
  const [eventId, setEventId] = useState<string | undefined>(initialExpense?.eventId);
  const [dateInput, setDateInput] = useState(
    initialExpense ? formatDate(initialExpense.date, 'yyyy-MM-dd') : todayKey(),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isForeign = currency !== baseCurrency;

  const amountInBase = useMemo(() => {
    const a = parseNum(amount);
    const r = isForeign ? parseNum(rate) : 1;
    if (!a || !r || a <= 0 || r <= 0) return 0;
    return a * r;
  }, [amount, rate, isForeign]);

  const shareValue = (id: string): string =>
    shareInputs[id] ?? (splitMode === 'shares' ? '1' : '');

  // Montants saisis (mode 'amounts') pour le contrôle du reste à répartir.
  const amountsDiff = useMemo(() => {
    if (splitMode !== 'amounts') return 0;
    const values = splitBetween.map((id) => parseNum(shareValue(id)) || 0);
    return amountsSplitDiff(amountInBase, values);
  }, [splitMode, splitBetween, shareInputs, amountInBase]);

  const equalPerPerson = useMemo(() => {
    if (splitMode !== 'equal' || amountInBase <= 0 || splitBetween.length === 0) return null;
    return amountInBase / splitBetween.length;
  }, [splitMode, amountInBase, splitBetween.length]);

  const toggleSplit = (id: string) =>
    setSplitBetween((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const setShare = (id: string, value: string) =>
    setShareInputs((prev) => ({ ...prev, [id]: value }));

  const parseDate = (s: string): Date | undefined => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return undefined;
    const d = new Date(s + 'T00:00:00');
    return isNaN(d.getTime()) ? undefined : d;
  };

  const buildShares = (): Record<string, number> | undefined => {
    if (splitMode === 'equal') return undefined;
    const out: Record<string, number> = {};
    for (const id of splitBetween) {
      const raw = shareInputs[id];
      const n = raw == null || raw === '' ? (splitMode === 'shares' ? 1 : 0) : parseNum(raw);
      out[id] = Number.isNaN(n) ? (splitMode === 'shares' ? 1 : 0) : n;
    }
    return out;
  };

  const handleSubmit = () => {
    const errs: Record<string, string> = {};
    const amountNum = parseNum(amount);
    const rateNum = isForeign ? parseNum(rate) : 1;
    const date = parseDate(dateInput);
    const shares = buildShares();

    if (!label.trim()) errs.label = t('expense.errLabelRequired');
    if (!amountNum || amountNum <= 0) errs.amount = t('expense.errAmountInvalid');
    if (isForeign && (!rateNum || rateNum <= 0)) errs.rate = t('expense.errRateInvalid');
    if (!paidBy) errs.paidBy = t('expense.errChoosePayer');
    if (splitBetween.length === 0) errs.split = t('expense.errAtLeastOneParticipant');
    if (splitMode === 'shares' && shares && Object.values(shares).reduce((a, b) => a + b, 0) <= 0) {
      errs.split = t('expense.errAtLeastOneShare');
    }
    if (splitMode === 'amounts' && amountsDiff !== 0) {
      errs.split = t('expense.errAmountsMustEqualTotal');
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0 || !date) return;

    onSubmit({
      label: label.trim(),
      amount: amountNum,
      currency,
      rate: rateNum,
      amountInBase: amountNum * rateNum,
      paidBy,
      splitMode,
      splitBetween,
      shares,
      category,
      date,
      eventId,
    });
  };

  const Chip = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
    <Pressable onPress={onPress} style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Input label={t('expense.labelField')} value={label} onChangeText={setLabel} error={errors.label} placeholder={t('expense.labelPlaceholder')} />

      <Input
        label={t('expense.amount')}
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
        placeholder={t('expense.amountPlaceholder')}
        error={errors.amount}
      />

      <Text style={styles.fieldLabel}>{t('expense.currency')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        {CURRENCIES.map((c) => (
          <Chip key={c} label={c} active={c === currency} onPress={() => setCurrency(c)} />
        ))}
      </ScrollView>

      {isForeign && (
        <Input
          label={t('expense.rate', { currency, base: baseCurrency })}
          value={rate}
          onChangeText={setRate}
          keyboardType="decimal-pad"
          error={errors.rate}
        />
      )}

      <Text style={styles.fieldLabel}>{t('expense.category')}</Text>
      <View style={styles.wrapRow}>
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
                {t(meta.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.fieldLabel}>{t('expense.paidByField')}</Text>
      {errors.paidBy && <Text style={styles.errorText}>{errors.paidBy}</Text>}
      <View style={styles.wrapRow}>
        {participants.map((p) => (
          <Chip key={p.id} label={p.displayName} active={p.id === paidBy} onPress={() => setPaidBy(p.id)} />
        ))}
      </View>

      <Text style={styles.fieldLabel}>{t('expense.split')}</Text>
      <View style={styles.segment}>
        {SPLIT_MODES.map((m) => (
          <Pressable
            key={m.mode}
            onPress={() => setSplitMode(m.mode)}
            style={[styles.segmentItem, splitMode === m.mode && styles.segmentItemActive]}
          >
            <Text style={[styles.segmentText, splitMode === m.mode && styles.segmentTextActive]}>
              {t(m.labelKey)}
            </Text>
          </Pressable>
        ))}
      </View>
      {errors.split && <Text style={styles.errorText}>{errors.split}</Text>}

      {splitMode === 'equal' ? (
        <View style={styles.wrapRow}>
          {participants.map((p) => (
            <Chip
              key={p.id}
              label={p.displayName}
              active={splitBetween.includes(p.id)}
              onPress={() => toggleSplit(p.id)}
            />
          ))}
        </View>
      ) : (
        <View>
          {participants.map((p) => {
            const included = splitBetween.includes(p.id);
            return (
              <View key={p.id} style={styles.shareRow}>
                <Pressable onPress={() => toggleSplit(p.id)} style={styles.shareCheck} hitSlop={6}>
                  <Ionicons
                    name={included ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={included ? colors.primary : colors.textMuted}
                  />
                </Pressable>
                <Text style={styles.shareName} numberOfLines={1}>
                  {p.displayName}
                </Text>
                {included && (
                  <TextInput
                    value={shareValue(p.id)}
                    onChangeText={(v) => setShare(p.id, v)}
                    keyboardType="decimal-pad"
                    placeholder={splitMode === 'shares' ? t('expense.sharesPlaceholder') : baseCurrency}
                    placeholderTextColor={colors.textMuted}
                    style={styles.shareInput}
                  />
                )}
              </View>
            );
          })}
        </View>
      )}

      {equalPerPerson != null && (
        <Text style={styles.preview}>
          {t('expense.perPerson', { amount: equalPerPerson.toFixed(2), currency: baseCurrency })}
        </Text>
      )}
      {splitMode === 'amounts' && amountInBase > 0 && (
        <Text style={[styles.preview, amountsDiff === 0 ? styles.previewOk : styles.previewWarn]}>
          {amountsDiff === 0
            ? t('expense.fullyAllocated', { amount: amountInBase.toFixed(2), currency: baseCurrency })
            : t('expense.remainingToAllocate', { amount: amountsDiff.toFixed(2), currency: baseCurrency })}
        </Text>
      )}

      {events.length > 0 && (
        <>
          <Text style={styles.fieldLabel}>{t('expense.linkEvent')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            <Chip label={t('expense.none')} active={!eventId} onPress={() => setEventId(undefined)} />
            {events.map((ev) => (
              <Chip
                key={ev.id}
                label={ev.name}
                active={eventId === ev.id}
                onPress={() => setEventId(ev.id)}
              />
            ))}
          </ScrollView>
        </>
      )}

      <Input
        label={t('expense.dateField')}
        value={dateInput}
        onChangeText={setDateInput}
        placeholder={t('expense.datePlaceholder')}
        error={errors.date}
      />

      <Button
        title={initialExpense ? t('common.save') : t('expense.addExpense')}
        onPress={handleSubmit}
        loading={submitting}
        style={{ marginTop: spacing.sm }}
      />
    </ScrollView>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  container: { padding: spacing.md, paddingBottom: spacing.xl },
  fieldLabel: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
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
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.md },
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
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.border,
    borderRadius: radius.md,
    padding: 2,
    marginBottom: spacing.sm,
  },
  segmentItem: { flex: 1, paddingVertical: spacing.xs + 2, alignItems: 'center', borderRadius: radius.sm },
  segmentItemActive: { backgroundColor: colors.surface },
  segmentText: { fontSize: fontSize.sm, color: colors.textMuted, fontWeight: '600' },
  segmentTextActive: { color: colors.primary },
  shareRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  shareCheck: { padding: 2 },
  shareName: { flex: 1, fontSize: fontSize.md, color: colors.text },
  shareInput: {
    width: 90,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    fontSize: fontSize.md,
    color: colors.text,
    textAlign: 'right',
    backgroundColor: colors.surface,
  },
  preview: { fontSize: fontSize.sm, color: colors.textMuted, marginBottom: spacing.md, fontStyle: 'italic' },
  previewOk: { color: colors.success },
  previewWarn: { color: colors.warning, fontStyle: 'normal', fontWeight: '600' },
  errorText: { color: colors.danger, fontSize: fontSize.xs, marginBottom: spacing.xs },
});
