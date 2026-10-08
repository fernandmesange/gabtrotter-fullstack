# Vérifier la collecte côté backend

Ces tests fournissent une preuve reproductible des comportements essentiels de collecte. Les réponses HTTP et les documents MongoDB sont vérifiés.

## Exécuter les tests

Depuis `gabtrotter-fullstack/Backend`, utilisez Node.js 20.19 ou ultérieur.

```sh
npm ci
npm test
```

Le premier lancement peut télécharger le binaire MongoDB utilisé par `mongodb-memory-server`. Il nécessite un accès réseau et un système compatible avec ce binaire. Les lancements suivants réutilisent le cache. Un téléchargement impossible fait échouer les tests, sans les ignorer.

Les tests créent un MongoDB temporaire et un serveur HTTP sur `127.0.0.1`, avec des ports disponibles. Ils utilisent des comptes fictifs et des clés de test. Aucun fichier `.env`, serveur MongoDB existant, SMTP ou service de production n'est nécessaire. Les collections de test sont vidées entre les scénarios, puis le serveur et la base temporaire sont arrêtés.

Pour transmettre cette preuve, fournissez les sources courantes, `package-lock.json`, la version de Node.js et la sortie des commandes avec leur code retour. Les services et tests ajoutés localement doivent être inclus dans les sources remises.

Pour exécuter seulement les neuf scénarios HTTP et MongoDB, utilisez la commande suivante.

```sh
node --test test/collection.integration.test.js
```

Pour isoler un scénario, placez son filtre avant le chemin du fichier.

```sh
node --test --test-name-pattern='lot partiellement valide' test/collection.integration.test.js
```

## Examiner les preuves

Les quinze tests existants restent exécutés par `npm test`. Ils couvrent les autorisations, le chiffrement, la validation des soumissions, la conservation et le hachage du reçu. Le test de chiffrement vérifie désormais aussi le rejet d'un contenu altéré.

Les neuf tests de `collection.integration.test.js` utilisent les routes Express et les modèles Mongoose de l'application.

| Scénario | Preuve vérifiée |
| --- | --- |
| Connexion et session | Un compte valide ouvre une session. Un mauvais mot de passe, un jeton invalide et un compte supprimé sont refusés. |
| Campagnes et rôles | Un agent lit les campagnes. La création est refusée à l'agent et acceptée pour le superviseur. |
| Envoi non autorisé | Sans session ou avec le rôle bénéficiaire, aucune réponse ni aucun audit n'est enregistré. |
| Envoi accepté | La réponse est enregistrée chiffrée, rattachée à l'agent et à l'appareil. L'échéance de conservation vaut trente jours. Le superviseur lit les réponses déchiffrées, sans le contenu chiffré ni le hachage du reçu. L'agent ne peut pas les consulter. |
| Réessais | Le même lot renvoie le même accusé. La même soumission dans un nouveau lot est signalée comme doublon. Une seule réponse existe. |
| Envois simultanés | Deux lots concurrents portant la même soumission réussissent avec une réponse acceptée et un doublon. Une seule réponse existe. |
| Soumissions refusées | La preuve absente, la notice périmée, le consentement refusé, le reçu absent et une version de questionnaire inconnue ne créent aucune réponse. |
| Lot partiellement valide | Chaque identifiant reçoit son statut `synced`, `duplicate` ou `rejected`. Les compteurs et la persistance correspondent aux trois statuts. |
| Droits du répondant | Un mauvais reçu est refusé. Après validation administrateur, le reçu permet de télécharger sa collecte. Une demande d'effacement approuvée supprime la réponse et rend ce téléchargement indisponible. |

## Vérifier le parcours mobile et backend

Placez le dépôt `gabtrotter-survey-app` à côté de `gabtrotter-fullstack`. Installez Flutter et les dépendances mobiles avec `flutter pub get` dans ce dépôt. Depuis `gabtrotter-fullstack/Backend`, exécutez la commande suivante.

```sh
npm run test:mobile
```

Ce scénario utilise les services mobiles de connexion, SQLite et de synchronisation, puis les routes backend et MongoDB temporaires. Il vérifie l'envoi d'une collecte conservée localement et sa consultation autorisée côté serveur. Consultez aussi [la documentation des tests mobiles](https://github.com/fernandmesange/gabtrotter-survey-app/blob/main/docs/tests-mobile.md).

## Résultat et limites

Le 8 octobre 2026, `npm ci` puis `npm test` réussissent avec **24 tests sur 24**, sans test ignoré, sous Node.js 26.8.1. `npm run test:mobile` réussit son scénario commun. Il vérifie aussi qu'un second envoi de la même collecte conserve une seule réponse MongoDB et que le superviseur relit les réponses, la localisation et le consentement.

Ces preuves concernent le parcours de collecte testé. Elles ne prouvent pas le déploiement, le fonctionnement du frontend, tous les endpoints, la suppression automatique par TTL, les services externes ou le fonctionnement sur un téléphone réel. Le serveur de test monte les routes applicatives sans démarrer `index.js`. La configuration globale CORS, les limites de requêtes et le service des fichiers frontend ne sont pas vérifiés par cette suite.
