// Chaînes des écrans Timeline, Rappels et Carte.
const tripx = {
  fr: {
    // Timeline
    'tripx.emptyItineraryTitle': 'Itinéraire vide',
    'tripx.emptyItinerarySubtitle': 'Ajoutez des événements pour voir la timeline du voyage.',
    'tripx.nothingPlanned': 'Rien de prévu',

    // Rappels
    'tripx.reminderStatusUnavailable': 'Statut des rappels indisponible',
    'tripx.scheduledCount': '{count} rappel(s) programmé(s)',
    'tripx.upcomingWithTime': '{count} événement(s) à venir avec une heure pourront recevoir un rappel.',
    'tripx.leadByType': 'Anticipation par type',
    'tripx.leadTransport': '3 h avant le départ',
    'tripx.leadAccommodation': '2 h avant le check-in',
    'tripx.leadHourBefore': '1 h avant',
    'tripx.scheduleReminders': 'Programmer les rappels',
    'tripx.cancelReminders': 'Annuler les rappels',
    'tripx.remindersFootnote':
      "Reprogrammez après avoir modifié l'itinéraire pour garder les rappels à jour. Les rappels sont locaux à cet appareil.",
    'tripx.permissionDeniedTitle': 'Permission refusée',
    'tripx.permissionDeniedMessage':
      'Autorisez les notifications dans les réglages pour recevoir les rappels.',
    'tripx.remindersScheduledTitle': 'Rappels programmés',
    'tripx.remindersScheduledMessage': '{count} rappel(s) programmé(s) pour ce voyage.',
    'tripx.unavailableTitle': 'Indisponible',
    'tripx.remindersUnavailableMessage':
      '{message}\n\nLes notifications nécessitent un build de développement (elles ne fonctionnent pas dans Expo Go sur SDK 55).',

    // Carte
    'tripx.mapUnavailableTitle': 'Carte indisponible ici',
    'tripx.mapUnavailableSubtitle':
      "La carte nécessite un build de développement (react-native-maps ne fonctionne pas dans Expo Go).",
    'tripx.noLocatedPlacesTitle': 'Aucun lieu localisé',
    'tripx.someHaveAddress':
      '{count} lieu(x) ont une adresse. Lancez la localisation pour les placer sur la carte.',
    'tripx.addAddressHint': 'Ajoutez une adresse aux hébergements, activités ou restaurants.',
    'tripx.locatePlaces': 'Localiser les lieux',
    'tripx.locateCount': 'Localiser {count} lieu(x)',
    'tripx.geocoding': 'Localisation…',
    'tripx.geocodeDoneTitle': 'Localisation terminée',
    'tripx.geocodeDone': '{done} lieu(x) localisé(s).',
    'tripx.geocodeDoneWithFailures': '{done} lieu(x) localisé(s), {failed} introuvable(s).',
  },
  en: {
    // Timeline
    'tripx.emptyItineraryTitle': 'Empty itinerary',
    'tripx.emptyItinerarySubtitle': 'Add events to see the trip timeline.',
    'tripx.nothingPlanned': 'Nothing planned',

    // Reminders
    'tripx.reminderStatusUnavailable': 'Reminder status unavailable',
    'tripx.scheduledCount': '{count} reminder(s) scheduled',
    'tripx.upcomingWithTime': '{count} upcoming event(s) with a time can receive a reminder.',
    'tripx.leadByType': 'Lead time by type',
    'tripx.leadTransport': '3 h before departure',
    'tripx.leadAccommodation': '2 h before check-in',
    'tripx.leadHourBefore': '1 h before',
    'tripx.scheduleReminders': 'Schedule reminders',
    'tripx.cancelReminders': 'Cancel reminders',
    'tripx.remindersFootnote':
      'Reschedule after editing the itinerary to keep reminders up to date. Reminders are local to this device.',
    'tripx.permissionDeniedTitle': 'Permission denied',
    'tripx.permissionDeniedMessage':
      'Allow notifications in settings to receive reminders.',
    'tripx.remindersScheduledTitle': 'Reminders scheduled',
    'tripx.remindersScheduledMessage': '{count} reminder(s) scheduled for this trip.',
    'tripx.unavailableTitle': 'Unavailable',
    'tripx.remindersUnavailableMessage':
      '{message}\n\nNotifications require a development build (they do not work in Expo Go on SDK 55).',

    // Map
    'tripx.mapUnavailableTitle': 'Map unavailable here',
    'tripx.mapUnavailableSubtitle':
      'The map requires a development build (react-native-maps does not work in Expo Go).',
    'tripx.noLocatedPlacesTitle': 'No located places',
    'tripx.someHaveAddress':
      '{count} place(s) have an address. Run geocoding to place them on the map.',
    'tripx.addAddressHint': 'Add an address to accommodations, activities or restaurants.',
    'tripx.locatePlaces': 'Locate places',
    'tripx.locateCount': 'Locate {count} place(s)',
    'tripx.geocoding': 'Locating…',
    'tripx.geocodeDoneTitle': 'Geocoding done',
    'tripx.geocodeDone': '{done} place(s) located.',
    'tripx.geocodeDoneWithFailures': '{done} place(s) located, {failed} not found.',
  },
  pt: {
    // Linha do tempo
    'tripx.emptyItineraryTitle': 'Itinerário vazio',
    'tripx.emptyItinerarySubtitle': 'Adicione eventos para ver a linha do tempo da viagem.',
    'tripx.nothingPlanned': 'Nada planejado',

    // Lembretes
    'tripx.reminderStatusUnavailable': 'Status dos lembretes indisponível',
    'tripx.scheduledCount': '{count} lembrete(s) agendado(s)',
    'tripx.upcomingWithTime': '{count} evento(s) futuro(s) com horário podem receber um lembrete.',
    'tripx.leadByType': 'Antecedência por tipo',
    'tripx.leadTransport': '3 h antes da partida',
    'tripx.leadAccommodation': '2 h antes do check-in',
    'tripx.leadHourBefore': '1 h antes',
    'tripx.scheduleReminders': 'Agendar os lembretes',
    'tripx.cancelReminders': 'Cancelar os lembretes',
    'tripx.remindersFootnote':
      'Reagende após editar o itinerário para manter os lembretes atualizados. Os lembretes são locais neste dispositivo.',
    'tripx.permissionDeniedTitle': 'Permissão negada',
    'tripx.permissionDeniedMessage':
      'Permita as notificações nas configurações para receber os lembretes.',
    'tripx.remindersScheduledTitle': 'Lembretes agendados',
    'tripx.remindersScheduledMessage': '{count} lembrete(s) agendado(s) para esta viagem.',
    'tripx.unavailableTitle': 'Indisponível',
    'tripx.remindersUnavailableMessage':
      '{message}\n\nAs notificações exigem um build de desenvolvimento (não funcionam no Expo Go no SDK 55).',

    // Mapa
    'tripx.mapUnavailableTitle': 'Mapa indisponível aqui',
    'tripx.mapUnavailableSubtitle':
      'O mapa exige um build de desenvolvimento (o react-native-maps não funciona no Expo Go).',
    'tripx.noLocatedPlacesTitle': 'Nenhum local localizado',
    'tripx.someHaveAddress':
      '{count} local(is) têm um endereço. Inicie a localização para colocá-los no mapa.',
    'tripx.addAddressHint': 'Adicione um endereço às hospedagens, atividades ou restaurantes.',
    'tripx.locatePlaces': 'Localizar os locais',
    'tripx.locateCount': 'Localizar {count} local(is)',
    'tripx.geocoding': 'Localizando…',
    'tripx.geocodeDoneTitle': 'Localização concluída',
    'tripx.geocodeDone': '{done} local(is) localizado(s).',
    'tripx.geocodeDoneWithFailures': '{done} local(is) localizado(s), {failed} não encontrado(s).',
  },
};

export default tripx;
