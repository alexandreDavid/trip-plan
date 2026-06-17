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
    'trip.startDate': 'Début *',
    'trip.endDate': 'Fin *',
    'trip.datePlaceholder': 'Choisir une date',
    'trip.currency': 'Devise',
    'trip.create': 'Creer le voyage',

    // Jours
    'trip.day': 'Jour {index}',

    // Budget
    'trip.budgetTotal': 'Budget total',

    // Partage
    'trip.inviteCollaborators': 'Inviter des collaborateurs',
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
    'trip.actions.participants': 'Participants',
    'trip.inviteLinkTitle': "Lien d'invitation",
    'trip.inviteLinkHint': 'Toute personne avec ce lien peut rejoindre le voyage en lecteur.',
    'trip.createInviteLink': "Créer un lien d'invitation",
    'trip.shareLink': 'Partager le lien',
    'trip.revokeLink': 'Révoquer',
    'trip.revokeLinkTitle': 'Révoquer le lien ?',
    'trip.revokeLinkMsg': 'Le lien actuel ne fonctionnera plus.',
    'trip.inviteShareMessage':
      'Rejoins mon voyage « {trip} » sur Trip Plan : {link}\nOu colle ce code dans l’app : {code}',
    'trip.membersReadonly': 'Vous consultez ce voyage.',
    'trip.joinTitle': 'Rejoindre un voyage',
    'trip.joinHint': 'Colle le code ou le lien d’invitation que tu as reçu.',
    'trip.joinPlaceholder': 'Code ou lien',
    'trip.joinAction': 'Rejoindre',
    'trip.joinInvalid': 'Code ou lien invalide',
    'trip.joinFailed': 'Impossible de rejoindre (lien invalide ou déjà membre).',
    'trip.manualParticipantHint': 'Ajoutez des personnes par leur nom (sans compte) pour partager les dépenses.',
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
    'trip.startDate': 'Start *',
    'trip.endDate': 'End *',
    'trip.datePlaceholder': 'Pick a date',
    'trip.currency': 'Currency',
    'trip.create': 'Create trip',

    // Days
    'trip.day': 'Day {index}',

    // Budget
    'trip.budgetTotal': 'Total budget',

    // Sharing
    'trip.inviteCollaborators': 'Invite collaborators',
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
    'trip.actions.participants': 'Participants',
    'trip.inviteLinkTitle': 'Invite link',
    'trip.inviteLinkHint': 'Anyone with this link can join the trip as a viewer.',
    'trip.createInviteLink': 'Create an invite link',
    'trip.shareLink': 'Share link',
    'trip.revokeLink': 'Revoke',
    'trip.revokeLinkTitle': 'Revoke the link?',
    'trip.revokeLinkMsg': 'The current link will stop working.',
    'trip.inviteShareMessage':
      'Join my trip "{trip}" on Trip Plan: {link}\nOr paste this code in the app: {code}',
    'trip.membersReadonly': 'You are viewing this trip.',
    'trip.joinTitle': 'Join a trip',
    'trip.joinHint': 'Paste the invite code or link you received.',
    'trip.joinPlaceholder': 'Code or link',
    'trip.joinAction': 'Join',
    'trip.joinInvalid': 'Invalid code or link',
    'trip.joinFailed': 'Could not join (invalid link or already a member).',
    'trip.manualParticipantHint': 'Add people by name (no account) to split expenses.',
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
    'trip.startDate': 'Início *',
    'trip.endDate': 'Fim *',
    'trip.datePlaceholder': 'Escolher uma data',
    'trip.currency': 'Moeda',
    'trip.create': 'Criar viagem',

    // Dias
    'trip.day': 'Dia {index}',

    // Orçamento
    'trip.budgetTotal': 'Orçamento total',

    // Compartilhamento
    'trip.inviteCollaborators': 'Convidar colaboradores',
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
    'trip.actions.participants': 'Participantes',
    'trip.inviteLinkTitle': 'Link de convite',
    'trip.inviteLinkHint': 'Qualquer pessoa com este link pode entrar na viagem como visualizador.',
    'trip.createInviteLink': 'Criar um link de convite',
    'trip.shareLink': 'Compartilhar link',
    'trip.revokeLink': 'Revogar',
    'trip.revokeLinkTitle': 'Revogar o link?',
    'trip.revokeLinkMsg': 'O link atual deixará de funcionar.',
    'trip.inviteShareMessage':
      'Entre na minha viagem "{trip}" no Trip Plan: {link}\nOu cole este código no app: {code}',
    'trip.membersReadonly': 'Você está visualizando esta viagem.',
    'trip.joinTitle': 'Entrar em uma viagem',
    'trip.joinHint': 'Cole o código ou link de convite que você recebeu.',
    'trip.joinPlaceholder': 'Código ou link',
    'trip.joinAction': 'Entrar',
    'trip.joinInvalid': 'Código ou link inválido',
    'trip.joinFailed': 'Não foi possível entrar (link inválido ou já é membro).',
    'trip.manualParticipantHint': 'Adicione pessoas pelo nome (sem conta) para dividir as despesas.',
  } as Record<string, string>,
};

export default trip;
