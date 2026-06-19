// Config Expo dynamique : tout vient de app.json, sauf la clé Google Maps Android
// qu'on injecte depuis l'environnement (pour ne pas la committer dans le dépôt).
//   - En local : GOOGLE_MAPS_ANDROID_API_KEY dans le fichier .env (chargé par Expo)
//   - Sur EAS  : variable d'environnement / secret EAS du même nom
// Si la variable est absente, on n'embarque aucune clé (la carte sera vide sur
// Android, mais le build reste valide).
module.exports = ({ config }) => {
  const googleMapsApiKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY;

  return {
    ...config,
    android: {
      ...config.android,
      ...(googleMapsApiKey
        ? {
            config: {
              ...config.android?.config,
              googleMaps: { apiKey: googleMapsApiKey },
            },
          }
        : {}),
    },
  };
};
