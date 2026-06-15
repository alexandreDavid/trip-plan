// Chaînes des écrans/composants d'événements (namespace « event »).
// Les clés event.type.* vivent dans common.ts (partagées).
const event = {
  fr: {
    // EventForm — libellés de champs
    'event.nameLabel': 'Nom *',
    'event.address': 'Adresse',
    'event.checkInLabel': 'Check-in (HH:mm)',
    'event.checkOutLabel': 'Check-out (HH:mm)',
    'event.checkOutDate': 'Date de check-out',
    'event.mode': 'Mode',
    'event.departure': 'Départ',
    'event.arrival': 'Arrivée',
    'event.departureTime': 'Heure départ',
    'event.arrivalTime': 'Heure arrivée',
    'event.place': 'Lieu',
    'event.start': 'Début',
    'event.end': 'Fin',
    'event.time': 'Heure',
    'event.budgetLabel': 'Budget',
    'event.notes': 'Notes',

    // EventForm — modes de transport
    'event.transport.flight': 'Avion',
    'event.transport.train': 'Train',
    'event.transport.bus': 'Bus',
    'event.transport.car': 'Voiture',
    'event.transport.ferry': 'Ferry',
    'event.transport.other': 'Autre',

    // EventCard — libellés horaires
    'event.checkInAt': 'Check-in {time}',
    'event.departAt': 'Départ {time}',
  },
  en: {
    // EventForm — field labels
    'event.nameLabel': 'Name *',
    'event.address': 'Address',
    'event.checkInLabel': 'Check-in (HH:mm)',
    'event.checkOutLabel': 'Check-out (HH:mm)',
    'event.checkOutDate': 'Check-out date',
    'event.mode': 'Mode',
    'event.departure': 'Departure',
    'event.arrival': 'Arrival',
    'event.departureTime': 'Departure time',
    'event.arrivalTime': 'Arrival time',
    'event.place': 'Place',
    'event.start': 'Start',
    'event.end': 'End',
    'event.time': 'Time',
    'event.budgetLabel': 'Budget',
    'event.notes': 'Notes',

    // EventForm — transport modes
    'event.transport.flight': 'Flight',
    'event.transport.train': 'Train',
    'event.transport.bus': 'Bus',
    'event.transport.car': 'Car',
    'event.transport.ferry': 'Ferry',
    'event.transport.other': 'Other',

    // EventCard — time labels
    'event.checkInAt': 'Check-in {time}',
    'event.departAt': 'Departure {time}',
  },
  pt: {
    // EventForm — rótulos de campos
    'event.nameLabel': 'Nome *',
    'event.address': 'Endereço',
    'event.checkInLabel': 'Check-in (HH:mm)',
    'event.checkOutLabel': 'Check-out (HH:mm)',
    'event.checkOutDate': 'Data de check-out',
    'event.mode': 'Modo',
    'event.departure': 'Partida',
    'event.arrival': 'Chegada',
    'event.departureTime': 'Horário de partida',
    'event.arrivalTime': 'Horário de chegada',
    'event.place': 'Local',
    'event.start': 'Início',
    'event.end': 'Fim',
    'event.time': 'Horário',
    'event.budgetLabel': 'Orçamento',
    'event.notes': 'Notas',

    // EventForm — modos de transporte
    'event.transport.flight': 'Avião',
    'event.transport.train': 'Trem',
    'event.transport.bus': 'Ônibus',
    'event.transport.car': 'Carro',
    'event.transport.ferry': 'Balsa',
    'event.transport.other': 'Outro',

    // EventCard — rótulos de horário
    'event.checkInAt': 'Check-in {time}',
    'event.departAt': 'Partida {time}',
  },
};

export default event;
