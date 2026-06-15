// Rempli lors de la conversion des écrans d'accueil (listes de voyages).
const home = {
  fr: {
    'home.empty.title': 'Aucun voyage',
    'home.empty.subtitle': 'Commencez par créer votre premier voyage',
    'home.empty.action': 'Créer un voyage',
    'home.sharedEmpty.title': 'Aucun voyage partagé',
    'home.sharedEmpty.subtitle': 'Les voyages partagés avec vous apparaîtront ici',
  } as Record<string, string>,
  en: {
    'home.empty.title': 'No trips',
    'home.empty.subtitle': 'Start by creating your first trip',
    'home.empty.action': 'Create a trip',
    'home.sharedEmpty.title': 'No shared trips',
    'home.sharedEmpty.subtitle': 'Trips shared with you will appear here',
  } as Record<string, string>,
};

export default home;
