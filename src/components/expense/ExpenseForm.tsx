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
import { SelectField } from '@/components/ui/SelectField';
import { Palette, radius, spacing, fontSize } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useT } from '@/i18n/I18nContext';
import { DateField } from '@/components/ui/DateField';
import { amountsSplitDiff, expensePayers } from '@/utils/expenses';
import { toDate } from '@/utils/dates';
import { expenseCategoryMeta, EXPENSE_CATEGORIES } from './expenseMeta';
import { PaymentBadge } from './PaymentBadge';

export interface ExpensePrefill {
  eventId?: string;
  label?: string;
  amount?: number;
  category?: ExpenseCategory;
  date?: Date;
}

interface Props {
  participants: Participant[];
  events: TripEvent[];
  baseCurrency: string;
  currentUid?: string;
  initialExpense?: Expense;
  prefill?: ExpensePrefill;
  submitting?: boolean;
  onSubmit: (input: ExpenseInput) => void;
}

const parseNum = (s: string | undefined): number => parseFloat((s ?? '').replace(',', '.'));

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
  prefill,
  submitting,
  onSubmit,
}: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const t = useT();

  // Payeurs initiaux (édition) ; tolère l'ancien format mono-payeur.
  const initialPayers = initialExpense ? expensePayers(initialExpense) : null;
  const defaultPayerId =
    participants.find((p) => p.uid === currentUid)?.id ?? participants[0]?.id ?? '';

  const [label, setLabel] = useState(initialExpense?.label ?? prefill?.label ?? '');
  const [amount, setAmount] = useState(
    initialExpense
      ? String(initialExpense.amount)
      : prefill?.amount != null
        ? String(prefill.amount)
        : '',
  );
  const [currency, setCurrency] = useState(initialExpense?.currency ?? baseCurrency);
  const [rate, setRate] = useState(initialExpense ? String(initialExpense.rate) : '1');
  const [category, setCategory] = useState<ExpenseCategory>(
    initialExpense?.category ?? prefill?.category ?? ExpenseCategory.FOOD,
  );
  // Qui a payé et combien. Chacun saisit ce qu'il a réellement payé ; la somme
  // peut être < total (partielle) ou nulle (non payée). Un seul payeur sans
  // montant saisi = a tout payé (cas courant).
  const [payerIds, setPayerIds] = useState<string[]>(
    initialPayers ? Object.keys(initialPayers) : defaultPayerId ? [defaultPayerId] : [],
  );
  const [payerInputs, setPayerInputs] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    if (initialPayers) for (const [id, v] of Object.entries(initialPayers)) init[id] = String(v);
    return init;
  });
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
  const [eventId, setEventId] = useState<string | undefined>(
    initialExpense?.eventId ?? prefill?.eventId,
  );
  const [date, setDate] = useState<Date>(
    initialExpense ? toDate(initialExpense.date) : prefill?.date ?? new Date(),
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

  // Un seul payeur sans montant saisi : il a tout payé (raccourci du cas courant).
  const singlePayerImplicitFull =
    payerIds.length === 1 && !(payerInputs[payerIds[0]]?.trim());

  // Montant réellement payé (devise de la dépense), d'après les saisies par payeur.
  const paidSum = useMemo(() => {
    if (payerIds.length === 0) return 0;
    if (singlePayerImplicitFull) return parseNum(amount) || 0;
    return payerIds.reduce((s, id) => s + (parseNum(payerInputs[id]) || 0), 0);
  }, [payerIds, payerInputs, amount, singlePayerImplicitFull]);

  const toggleSplit = (id: string) =>
    setSplitBetween((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const setShare = (id: string, value: string) =>
    setShareInputs((prev) => ({ ...prev, [id]: value }));

  const togglePayer = (id: string) =>
    setPayerIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const setPayerInput = (id: string, value: string) =>
    setPayerInputs((prev) => ({ ...prev, [id]: value }));

  // Map payeur -> montant payé. Un seul payeur sans saisie couvre tout le total.
  const buildPayers = (amountNum: number): Record<string, number> => {
    if (payerIds.length === 0) return {};
    if (singlePayerImplicitFull) return { [payerIds[0]]: amountNum };
    const out: Record<string, number> = {};
    for (const id of payerIds) out[id] = parseNum(payerInputs[id]) || 0;
    return out;
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
    const shares = buildShares();

    if (!label.trim()) errs.label = t('expense.errLabelRequired');
    if (!amountNum || amountNum <= 0) errs.amount = t('expense.errAmountInvalid');
    if (isForeign && (!rateNum || rateNum <= 0)) errs.rate = t('expense.errRateInvalid');
    // Les paiements ne peuvent pas dépasser le coût total (somme < total = partielle).
    const payers = buildPayers(amountNum);
    const paidTotal = Object.values(payers).reduce((a, b) => a + b, 0);
    if (amountNum > 0 && paidTotal > amountNum + 0.005) {
      errs.paidBy = t('expense.errPaymentsExceedTotal');
    }
    if (splitBetween.length === 0) errs.split = t('expense.errAtLeastOneParticipant');
    if (splitMode === 'shares' && shares && Object.values(shares).reduce((a, b) => a + b, 0) <= 0) {
      errs.split = t('expense.errAtLeastOneShare');
    }
    if (splitMode === 'amounts' && amountsDiff !== 0) {
      errs.split = t('expense.errAmountsMustEqualTotal');
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    onSubmit({
      label: label.trim(),
      amount: amountNum,
      currency,
      rate: rateNum,
      amountInBase: amountNum * rateNum,
      paidBy: payers,
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
      <View>
        {participants.map((p) => {
          const isPayer = payerIds.includes(p.id);
          return (
            <View key={p.id} style={styles.shareRow}>
              <Pressable onPress={() => togglePayer(p.id)} style={styles.shareCheck} hitSlop={6}>
                <Ionicons
                  name={isPayer ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={isPayer ? colors.primary : colors.textMuted}
                />
              </Pressable>
              <Text style={styles.shareName} numberOfLines={1}>
                {p.displayName}
              </Text>
              {isPayer && (
                <TextInput
                  value={payerInputs[p.id] ?? ''}
                  onChangeText={(v) => setPayerInput(p.id, v)}
                  keyboardType="decimal-pad"
                  placeholder={
                    payerIds.length === 1 && parseNum(amount) > 0
                      ? parseNum(amount).toFixed(2)
                      : currency
                  }
                  placeholderTextColor={colors.textMuted}
                  style={styles.shareInput}
                />
              )}
            </View>
          );
        })}
      </View>
      {parseNum(amount) > 0 && (
        <View style={styles.paymentStatusRow}>
          <PaymentBadge amount={parseNum(amount)} paidAmount={paidSum} currency={currency} />
        </View>
      )}

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
        <SelectField
          label={t('expense.linkEvent')}
          value={eventId}
          options={events.map((ev) => ({ value: ev.id, label: ev.name }))}
          noneLabel={t('expense.none')}
          placeholder={t('expense.none')}
          onChange={setEventId}
        />
      )}

      <DateField
        label={t('expense.dateField')}
        value={date}
        onChange={setDate}
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
  paymentStatusRow: { flexDirection: 'row', marginBottom: spacing.md },
  preview: { fontSize: fontSize.sm, color: colors.textMuted, marginBottom: spacing.md, fontStyle: 'italic' },
  previewOk: { color: colors.success },
  previewWarn: { color: colors.warning, fontStyle: 'normal', fontWeight: '600' },
  errorText: { color: colors.danger, fontSize: fontSize.xs, marginBottom: spacing.xs },
});
