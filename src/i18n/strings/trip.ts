// Chaînes des écrans de voyage (détail, édition, partage) et de leurs composants.
const trip = {
  fr: {
    // Détail du voyage
    'trip.actions.timeline': 'Timeline',
    'trip.actions.expenses': 'Dépenses',
    'trip.actions.reminders': 'Rappels',
    'trip.actions.map': 'Carte',
    'trip.empty.title': 'Aucun evenement',
    'trip.empty.subtitle': 'Ajoutez votre premier evenement',
    'trip.eventTypeTitle': "Type d'evenement",
    'trip.deleteTripTitle': 'Supprimer le voyage ?',
    'trip.deleteTripMsg': 'Cette action est irreversible.',
    'trip.deleteEventTitle': 'Supprimer cet evenement ?',

    // Édition / création de voyage
    'trip.coverAdd': 'Ajouter une image',
    'trip.name': 'Nom du voyage *',
    'trip.destination': 'Destination *',
    'trip.startDate': 'Debut (YYYY-MM-DD) *',
    'trip.endDate': 'Fin (YYYY-MM-DD) *',
    'trip.currency': 'Devise',
    'trip.create': 'Creer le voyage',

    // Jours
    'trip.day': 'Jour {index}',

    // Budget
    'trip.budgetTotal': 'Budget total',

    // Partage
    'trip.inviteByEmail': 'Inviter par email',
    'trip.shareExplanation':
      'Les personnes invitees peuvent modifier le voyage (editeur) par defaut. Touchez le badge de role pour passer un membre en lecteur.',
    'trip.invite': 'Inviter',
    'trip.sharedAccess': 'Acces partages',
    'trip.noOne': 'Personne',
    'trip.noShare': 'Aucun partage pour le moment',
    'trip.invalidEmail': 'Email invalide',
    'trip.unknownError': 'Erreur inconnue',
    'trip.removeAccessTitle': "Retirer l'acces ?",
    'trip.removeAccessMsg': '{name} ne pourra plus consulter ce voyage.',

    // Rôles
    'trip.role.owner': 'Organisateur',
    'trip.role.editor': 'Éditeur',
    'trip.role.viewer': 'Lecteur',
  } as Record<string, string>,
  en: {
    // Trip detail
    'trip.actions.timeline': 'Timeline',
    'trip.actions.expenses': 'Expenses',
    'trip.actions.reminders': 'Reminders',
    'trip.actions.map': 'Map',
    'trip.empty.title': 'No events',
    'trip.empty.subtitle': 'Add your first event',
    'trip.eventTypeTitle': 'Event type',
    'trip.deleteTripTitle': 'Delete trip?',
    'trip.deleteTripMsg': 'This action is irreversible.',
    'trip.deleteEventTitle': 'Delete this event?',

    // Trip edit / create
    'trip.coverAdd': 'Add an image',
    'trip.name': 'Trip name *',
    'trip.destination': 'Destination *',
    'trip.startDate': 'Start (YYYY-MM-DD) *',
    'trip.endDate': 'End (YYYY-MM-DD) *',
    'trip.currency': 'Currency',
    'trip.create': 'Create trip',

    // Days
    'trip.day': 'Day {index}',

    // Budget
    'trip.budgetTotal': 'Total budget',

    // Sharing
    'trip.inviteByEmail': 'Invite by email',
    'trip.shareExplanation':
      'Invited people can edit the trip (editor) by default. Tap the role badge to switch a member to viewer.',
    'trip.invite': 'Invite',
    'trip.sharedAccess': 'Shared access',
    'trip.noOne': 'No one',
    'trip.noShare': 'No sharing yet',
    'trip.invalidEmail': 'Invalid email',
    'trip.unknownError': 'Unknown error',
    'trip.removeAccessTitle': 'Remove access?',
    'trip.removeAccessMsg': '{name} will no longer be able to view this trip.',

    // Roles
    'trip.role.owner': 'Organizer',
    'trip.role.editor': 'Editor',
    'trip.role.viewer': 'Viewer',
  } as Record<string, string>,
  pt: {
    // Detalhe da viagem
    'trip.actions.timeline': 'Linha do tempo',
    'trip.actions.expenses': 'Despesas',
    'trip.actions.reminders': 'Lembretes',
    'trip.actions.map': 'Mapa',
    'trip.empty.title': 'Nenhum evento',
    'trip.empty.subtitle': 'Adicione seu primeiro evento',
    'trip.eventTypeTitle': 'Tipo de evento',
    'trip.deleteTripTitle': 'Excluir a viagem?',
    'trip.deleteTripMsg': 'Esta ação é irreversível.',
    'trip.deleteEventTitle': 'Excluir este evento?',

    // Edição / criação de viagem
    'trip.coverAdd': 'Adicionar uma imagem',
    'trip.name': 'Nome da viagem *',
    'trip.destination': 'Destino *',
    'trip.startDate': 'Início (YYYY-MM-DD) *',
    'trip.endDate': 'Fim (YYYY-MM-DD) *',
    'trip.currency': 'Moeda',
    'trip.create': 'Criar viagem',

    // Dias
    'trip.day': 'Dia {index}',

    // Orçamento
    'trip.budgetTotal': 'Orçamento total',

    // Compartilhamento
    'trip.inviteByEmail': 'Convidar por e-mail',
    'trip.shareExplanation':
      'As pessoas convidadas podem editar a viagem (editor) por padrão. Toque no selo de função para mudar um membro para visualizador.',
    'trip.invite': 'Convidar',
    'trip.sharedAccess': 'Acessos compartilhados',
    'trip.noOne': 'Ninguém',
    'trip.noShare': 'Nenhum compartilhamento por enquanto',
    'trip.invalidEmail': 'E-mail inválido',
    'trip.unknownError': 'Erro desconhecido',
    'trip.removeAccessTitle': 'Remover o acesso?',
    'trip.removeAccessMsg': '{name} não poderá mais ver esta viagem.',

    // Funções
    'trip.role.owner': 'Organizador',
    'trip.role.editor': 'Editor',
    'trip.role.viewer': 'Visualizador',
  } as Record<string, string>,
};

export default trip;
