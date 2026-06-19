// Chaînes des écrans/composants de dépenses.
const expense = {
  fr: {
    // ExpenseForm — libellés de champs
    'expense.labelField': 'Libellé *',
    'expense.labelPlaceholder': 'Dîner, taxi, musée…',
    'expense.amount': 'Montant *',
    'expense.amountPlaceholder': '0',
    'expense.currency': 'Devise',
    'expense.rate': 'Taux (1 {currency} = ? {base}) *',
    'expense.category': 'Catégorie',
    'expense.paidByField': 'Payé par *',
    'expense.split': 'Répartition',
    'expense.splitEqual': 'Égal',
    'expense.splitShares': 'Parts',
    'expense.splitAmounts': 'Montants',
    'expense.sharesPlaceholder': 'parts',
    'expense.dateField': 'Date *',
    'expense.datePlaceholder': '2026-06-15',
    'expense.linkEvent': 'Lier à un événement (optionnel)',
    'expense.none': 'Aucun',
    'expense.perPerson': 'Soit {amount} {currency} par personne',
    'expense.fullyAllocated': 'Réparti intégralement ({amount} {currency})',
    'expense.remainingToAllocate': 'Reste à répartir : {amount} {currency}',
    'expense.addExpense': 'Ajouter la dépense',

    // ExpenseForm — erreurs de validation
    'expense.errLabelRequired': 'Le libellé est requis',
    'expense.errAmountInvalid': 'Montant invalide',
    'expense.errRateInvalid': 'Taux invalide',
    'expense.errChoosePayer': 'Choisissez qui a payé',
    'expense.errAtLeastOneParticipant': 'Au moins un participant',
    'expense.errAtLeastOneShare': 'Indiquez au moins une part',
    'expense.errAmountsMustEqualTotal': 'La somme des montants doit égaler le total',

    // ExpenseCard
    'expense.paidBySplit': 'Payé par {payer} · {count} pers.',

    // Paiement : chaque payeur saisit ce qu'il a payé ; statut déduit (somme vs total)
    'expense.errPaymentsExceedTotal': 'Les paiements dépassent le total',
    'expense.paid': 'Payée',
    'expense.partiallyPaid': 'Partielle',
    'expense.unpaid': 'Non payée',

    // BalancePanel
    'expense.totalSpent': 'Total dépensé',
    'expense.balances': 'Soldes',
    'expense.suggestedSettlements': 'Remboursements suggérés',
    'expense.allSettled': 'Tout est équilibré',
    'expense.owes': '{from} doit {to}',

    // ExpensesScreen
    'expense.startWithParticipants': 'Commencez par les participants',
    'expense.startWithParticipantsSubtitle':
      'Ajoutez les personnes avec qui vous partagez les dépenses.',
    'expense.manageParticipants': 'Gérer les participants',
    'expense.expensesSection': 'Dépenses',
    'expense.noExpenses': 'Aucune dépense',
    'expense.addFirstExpense': 'Ajoutez votre première dépense',

    // AddEditExpenseScreen
    'expense.deleteConfirmTitle': 'Supprimer cette dépense ?',
    'expense.noParticipants': 'Aucun participant',
    'expense.noParticipantsSubtitle':
      "Ajoutez d'abord des participants au voyage pour répartir les dépenses.",

    // ParticipantsScreen
    'expense.addParticipant': 'Ajouter un participant',
    'expense.addParticipantSubtitle': "Pas besoin de compte : ajoutez n'importe qui par son nom.",
    'expense.firstNamePlaceholder': 'Prénom',
    'expense.addSelf': "M'ajouter au partage",
    'expense.selfDefaultName': 'Moi',
    'expense.noParticipantsYet': 'Personne',
    'expense.addFirstParticipant': 'Ajoutez le premier participant',
    'expense.linkedAccount': 'Compte lié',
    'expense.you': 'Vous',
    'expense.guest': 'Invité',
    'expense.peopleOne': '1 personne',
    'expense.peopleMany': '{count} personnes',
    'expense.totalSpentInline': '{amount} dépensés',
    'expense.cannotRemoveTitle': 'Impossible de retirer',
    'expense.cannotRemoveBody':
      "{name} est lié à des dépenses. Modifiez ou supprimez ces dépenses d'abord.",
    'expense.removeConfirmTitle': 'Retirer ce participant ?',
    'expense.removeConfirmBody': '{name} ne fera plus partie du partage.',
  },
  en: {
    // ExpenseForm — field labels
    'expense.labelField': 'Label *',
    'expense.labelPlaceholder': 'Dinner, taxi, museum…',
    'expense.amount': 'Amount *',
    'expense.amountPlaceholder': '0',
    'expense.currency': 'Currency',
    'expense.rate': 'Rate (1 {currency} = ? {base}) *',
    'expense.category': 'Category',
    'expense.paidByField': 'Paid by *',
    'expense.split': 'Split',
    'expense.splitEqual': 'Equal',
    'expense.splitShares': 'Shares',
    'expense.splitAmounts': 'Amounts',
    'expense.sharesPlaceholder': 'shares',
    'expense.dateField': 'Date *',
    'expense.datePlaceholder': '2026-06-15',
    'expense.linkEvent': 'Link to an event (optional)',
    'expense.none': 'None',
    'expense.perPerson': 'That is {amount} {currency} per person',
    'expense.fullyAllocated': 'Fully allocated ({amount} {currency})',
    'expense.remainingToAllocate': 'Remaining to allocate: {amount} {currency}',
    'expense.addExpense': 'Add expense',

    // ExpenseForm — validation errors
    'expense.errLabelRequired': 'Label is required',
    'expense.errAmountInvalid': 'Invalid amount',
    'expense.errRateInvalid': 'Invalid rate',
    'expense.errChoosePayer': 'Choose who paid',
    'expense.errAtLeastOneParticipant': 'At least one participant',
    'expense.errAtLeastOneShare': 'Enter at least one share',
    'expense.errAmountsMustEqualTotal': 'The sum of amounts must equal the total',

    // ExpenseCard
    'expense.paidBySplit': 'Paid by {payer} · {count} ppl',

    // Payment: each payer enters what they paid; status derived (sum vs total)
    'expense.errPaymentsExceedTotal': 'Payments exceed the total',
    'expense.paid': 'Paid',
    'expense.partiallyPaid': 'Partial',
    'expense.unpaid': 'Unpaid',

    // BalancePanel
    'expense.totalSpent': 'Total spent',
    'expense.balances': 'Balances',
    'expense.suggestedSettlements': 'Suggested settlements',
    'expense.allSettled': 'Everything is settled',
    'expense.owes': '{from} owes {to}',

    // ExpensesScreen
    'expense.startWithParticipants': 'Start with participants',
    'expense.startWithParticipantsSubtitle': 'Add the people you share expenses with.',
    'expense.manageParticipants': 'Manage participants',
    'expense.expensesSection': 'Expenses',
    'expense.noExpenses': 'No expenses',
    'expense.addFirstExpense': 'Add your first expense',

    // AddEditExpenseScreen
    'expense.deleteConfirmTitle': 'Delete this expense?',
    'expense.noParticipants': 'No participants',
    'expense.noParticipantsSubtitle':
      'Add participants to the trip first to split expenses.',

    // ParticipantsScreen
    'expense.addParticipant': 'Add a participant',
    'expense.addParticipantSubtitle': 'No account needed: add anyone by their name.',
    'expense.firstNamePlaceholder': 'First name',
    'expense.addSelf': 'Add myself to the split',
    'expense.selfDefaultName': 'Me',
    'expense.noParticipantsYet': 'Nobody',
    'expense.addFirstParticipant': 'Add the first participant',
    'expense.linkedAccount': 'Linked account',
    'expense.you': 'You',
    'expense.guest': 'Guest',
    'expense.peopleOne': '1 person',
    'expense.peopleMany': '{count} people',
    'expense.totalSpentInline': '{amount} spent',
    'expense.cannotRemoveTitle': 'Cannot remove',
    'expense.cannotRemoveBody':
      '{name} is linked to expenses. Edit or delete those expenses first.',
    'expense.removeConfirmTitle': 'Remove this participant?',
    'expense.removeConfirmBody': '{name} will no longer be part of the split.',
  },
  pt: {
    // ExpenseForm — rótulos de campos
    'expense.labelField': 'Descrição *',
    'expense.labelPlaceholder': 'Jantar, táxi, museu…',
    'expense.amount': 'Valor *',
    'expense.amountPlaceholder': '0',
    'expense.currency': 'Moeda',
    'expense.rate': 'Taxa (1 {currency} = ? {base}) *',
    'expense.category': 'Categoria',
    'expense.paidByField': 'Pago por *',
    'expense.split': 'Divisão',
    'expense.splitEqual': 'Igual',
    'expense.splitShares': 'Cotas',
    'expense.splitAmounts': 'Valores',
    'expense.sharesPlaceholder': 'cotas',
    'expense.dateField': 'Data *',
    'expense.datePlaceholder': '2026-06-15',
    'expense.linkEvent': 'Vincular a um evento (opcional)',
    'expense.none': 'Nenhum',
    'expense.perPerson': 'Ou seja, {amount} {currency} por pessoa',
    'expense.fullyAllocated': 'Totalmente distribuído ({amount} {currency})',
    'expense.remainingToAllocate': 'Falta distribuir: {amount} {currency}',
    'expense.addExpense': 'Adicionar despesa',

    // ExpenseForm — erros de validação
    'expense.errLabelRequired': 'A descrição é obrigatória',
    'expense.errAmountInvalid': 'Valor inválido',
    'expense.errRateInvalid': 'Taxa inválida',
    'expense.errChoosePayer': 'Escolha quem pagou',
    'expense.errAtLeastOneParticipant': 'Pelo menos um participante',
    'expense.errAtLeastOneShare': 'Informe pelo menos uma cota',
    'expense.errAmountsMustEqualTotal': 'A soma dos valores deve ser igual ao total',

    // ExpenseCard
    'expense.paidBySplit': 'Pago por {payer} · {count} pessoas',

    // Pagamento: cada pagador informa o que pagou; status deduzido (soma vs total)
    'expense.errPaymentsExceedTotal': 'Os pagamentos excedem o total',
    'expense.paid': 'Paga',
    'expense.partiallyPaid': 'Parcial',
    'expense.unpaid': 'Não paga',

    // BalancePanel
    'expense.totalSpent': 'Total gasto',
    'expense.balances': 'Saldos',
    'expense.suggestedSettlements': 'Reembolsos sugeridos',
    'expense.allSettled': 'Tudo equilibrado',
    'expense.owes': '{from} deve a {to}',

    // ExpensesScreen
    'expense.startWithParticipants': 'Comece pelos participantes',
    'expense.startWithParticipantsSubtitle': 'Adicione as pessoas com quem você divide as despesas.',
    'expense.manageParticipants': 'Gerenciar participantes',
    'expense.expensesSection': 'Despesas',
    'expense.noExpenses': 'Nenhuma despesa',
    'expense.addFirstExpense': 'Adicione sua primeira despesa',

    // AddEditExpenseScreen
    'expense.deleteConfirmTitle': 'Excluir esta despesa?',
    'expense.noParticipants': 'Nenhum participante',
    'expense.noParticipantsSubtitle':
      'Adicione participantes à viagem primeiro para dividir as despesas.',

    // ParticipantsScreen
    'expense.addParticipant': 'Adicionar participante',
    'expense.addParticipantSubtitle': 'Sem precisar de conta: adicione qualquer pessoa pelo nome.',
    'expense.firstNamePlaceholder': 'Nome',
    'expense.addSelf': 'Adicionar a mim na divisão',
    'expense.selfDefaultName': 'Eu',
    'expense.noParticipantsYet': 'Ninguém',
    'expense.addFirstParticipant': 'Adicione o primeiro participante',
    'expense.linkedAccount': 'Conta vinculada',
    'expense.you': 'Você',
    'expense.guest': 'Convidado',
    'expense.peopleOne': '1 pessoa',
    'expense.peopleMany': '{count} pessoas',
    'expense.totalSpentInline': '{amount} gastos',
    'expense.cannotRemoveTitle': 'Não é possível remover',
    'expense.cannotRemoveBody':
      '{name} está vinculado a despesas. Edite ou exclua essas despesas primeiro.',
    'expense.removeConfirmTitle': 'Remover este participante?',
    'expense.removeConfirmBody': '{name} não fará mais parte da divisão.',
  },
};

export default expense;
