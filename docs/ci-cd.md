# Activer les tests et le déploiement Docker par SSH

Le workflow `.github/workflows/ci.yml` exécute les 24 tests backend, les 19 tests mobile et le parcours commun sur les pull requests, les pushes sur `main` et les lancements manuels. Il construit ensuite une image Docker Linux `amd64` et la lance contre un MongoDB temporaire. Les scénarios applicatifs sont décrits dans [les tests backend](tests-backend.md) et [les tests mobile](https://github.com/fernandmesange/gabtrotter-survey-app/blob/main/docs/tests-mobile.md).

## Configurer GitHub

1. Incluez les tests, services, scripts et fichiers de verrouillage actuels dans les deux dépôts. Les fichiers présents seulement sur le poste local ne seront pas accessibles à GitHub Actions.
2. Dans `fernandmesange/gabtrotter-fullstack`, créez le secret Actions `GABTROTTER_REPOS_TOKEN`. Utilisez un token finement limité au dépôt privé `fernandmesange/gabtrotter-survey-app`, avec `Contents: Read-only`.
3. Créez les variables Actions `VITE_API_URL` et `VITE_RECAPTCHA_SITE_KEY` avec les valeurs publiques du frontend de production. `VITE_API_URL` désigne l'origine du backend, sans `/api`. Ces valeurs entrent dans le JavaScript compilé.
4. Créez la variable `MOBILE_REF` avec le SHA mobile validé. Sans cette variable, le workflow utilise `main`. Le résumé enregistre toujours les deux SHA réellement testés.
5. Activez GitHub Actions et autorisez `GITHUB_TOKEN` à écrire les packages GHCR. Aucun mot de passe du registre n'est nécessaire sur le runner.
6. Créez l'environnement GitHub `production`. Dans cet environnement, configurez les variables `SSH_HOST`, `SSH_USER` et `DEPLOY_PATH`. Le chemin désigne un dossier absolu déjà préparé sur le serveur. La variable `SSH_PORT` vaut `22` par défaut.
7. Dans `production`, créez les secrets `SSH_PRIVATE_KEY` et `SSH_KNOWN_HOSTS`. Le premier contient la clé du compte de déploiement. Le second contient l'entrée SSH du serveur dont vous avez vérifié l'empreinte hors bande. Pour un port différent de 22, utilisez l'entrée `[hôte]:port`. Le script impose la vérification de cette clé d'hôte.
8. Dans la protection de `main`, exigez les contrôles `Tests backend et mobile` et `Image Docker testée` avant fusion.
9. Commitez et poussez les fichiers CI pour déclencher la première exécution. Vérifiez le résumé et les journaux dans l'onglet Actions.

Un secret absent ou un test échoué arrête la chaîne. Les PR provenant d'un fork ne reçoivent pas le secret privé et échouent explicitement. Reprenez les changements approuvés dans une branche de confiance pour les tester. Le workflow utilise `pull_request`, et les checkouts ne conservent pas les identifiants Git.

Sur un push réussi sur le `main` du dépôt propriétaire, le workflow publie la même image que celle exécutée par le contrôle Docker. Il ne la reconstruit pas. Le tag vaut `ghcr.io/fernandmesange/gabtrotter-fullstack:sha-<SHA complet>-run-<identifiant du run>-<tentative>`. Chaque relance conserve un tag distinct. Le job SSH reçoit le digest exact publié, puis l'installe sur le serveur. Les résumés indiquent les digests publié et déployé. Les PR et les lancements manuels construisent et testent sans publier ni déployer. Un push sur `main` sans les deux variables frontend échoue avant construction. Les pushes sur `main` ne peuvent pas interrompre un déploiement en cours.

## Rejouer les contrôles localement

Placez `gabtrotter-fullstack` et `gabtrotter-survey-app` dans le même dossier parent. Installez Node.js 22, Flutter 3.44.7 et Docker. Sur Linux, installez `libsqlite3-dev` pour SQLite. Depuis le dépôt mobile, exécutez :

```sh
flutter pub get --enforce-lockfile
dart format --output=none --set-exit-if-changed lib/services/local_database.dart lib/services/api_client.dart lib/services/sync_service.dart test
flutter analyze --no-pub lib/services/local_database.dart lib/services/api_client.dart lib/services/sync_service.dart test
flutter test --no-pub --reporter expanded
```

Depuis `gabtrotter-fullstack/Backend`, exécutez :

```sh
npm ci
npm test
npm run test:mobile
```

Depuis `gabtrotter-fullstack`, construisez l'image avec des valeurs publiques de test :

```sh
docker build --build-arg VITE_API_URL=http://localhost --build-arg VITE_RECAPTCHA_SITE_KEY=ci-synthetic-public-site-key -t gabtrotter-ci:local .
```

Depuis `Backend`, lancez l'image construite :

```sh
npm run test:docker -- gabtrotter-ci:local
```

Le script crée son réseau, son MongoDB et un compte fictif. Il vérifie `index.js` en mode production, le contrôle HTTP, la page React compilée et un fichier JavaScript, la connexion MongoDB, la session JWT et l'exécution sans root. Il vérifie aussi l'absence de `.env`, de tests et de `mongodb-memory-server` dans l'image. Il supprime ses conteneurs et son réseau à la fin. Le téléchargement initial des dépendances, du binaire MongoDB de test et des images Docker nécessite le réseau.

## Préparer le serveur SSH

Le Dockerfile intègre le frontend et les dépendances backend de production. `.dockerignore` exclut les secrets et fichiers de test. Le conteneur reçoit ses secrets au démarrage.

Installez Docker et Docker Compose compatible avec `up --wait` sur un serveur Linux disposant de Bash et de `flock`. Autorisez `SSH_USER` à utiliser Docker. Préparez `DEPLOY_PATH` et placez-y un fichier `.env` protégé avec les secrets applicatifs. Le pipeline ne copie aucun fichier `.env` et n'installe pas MongoDB.

Dans ce fichier serveur, fournissez `MONGO_URL`, `JWT_SECRET`, `FRONTEND_URL` et `SURVEY_DATA_ENCRYPTION_KEY`. Le Compose exige ces quatre valeurs avant le démarrage. Ajoutez les secrets messagerie et Cloudinary utilisés par votre configuration. La clé de chiffrement contient 32 octets encodés en base64. Conservez la clé qui chiffre les collectes existantes. Si le package GHCR est privé, configurez sur le serveur une connexion GHCR avec un accès en lecture au package.

Le déploiement SSH utilise `docker-compose.deploy.yml`. Le conteneur expose `127.0.0.1:5000` sur le serveur. Changez `APP_PORT` dans le fichier serveur si ce port est occupé. Configurez votre reverse proxy HTTPS pour atteindre ce port. Ce Compose utilise son propre réseau et ne demande pas `dokploy-network`. Le fichier `docker-compose.yml` existant conserve la configuration Dokploy pour les autres installations.

Le script verrouille `.deploy.lock` pour empêcher deux déploiements simultanés sur le serveur. Il attend ce verrou au maximum 180 secondes. Il télécharge `ghcr.io/...@sha256:...`, lance `docker compose up --wait`, puis vérifie `/api/health` et effectue une connexion MongoDB avec un ping. Il ne crée aucun compte ni donnée de collecte en production. Il enregistre le digest dans `.deployed-image` seulement après ces vérifications. Si la nouvelle image échoue, il tente de relancer le précédent digest réussi et conserve le statut d'échec du job. Le premier déploiement n'a pas de digest précédent à restaurer. Le rollback restaure l'image avec le fichier Compose courant. Il ne restaure pas la base ni le fichier `.env` du serveur.

Depuis une machine disposant des variables SSH et des secrets requis, vous pouvez rejouer le même script avec le digest publié dans `GABTROTTER_IMAGE` :

```sh
bash scripts/deploy-ssh.sh
```

Cette CI ne publie pas d'application mobile et ne valide pas les appareils, le frontend interactif ou les services externes. Les contrôles Flutter ciblent les services de collecte modifiés et les tests. Les quatre informations de nommage préexistantes dans les écrans restent décrites dans le guide mobile. Le ping prouve l'accès MongoDB, sans valider tous les parcours de production. Les exécutions GitHub et le déploiement réel pourront être confirmés après le premier push et la configuration des accès serveur.

## Vérifications locales du 8 octobre 2026

Les 24 tests backend exécutés avec Node.js 22, les 19 tests mobile et le parcours commun ont réussi. Le formatage et l'analyse Flutter ciblés passent. L'image Linux `amd64` a été construite et exécutée sur Docker Desktop ; le contrôle MongoDB, connexion utilisateur, JWT et fichiers web compilés passe. Les conteneurs temporaires ont été supprimés.

`actionlint` valide les deux workflows et `bash -n` valide le script SSH. Docker Compose accepte la configuration fictive et refuse chacune des quatre variables applicatives manquantes ainsi qu'un digest absent. Un rejeu avec des commandes SSH et Docker simulées valide le succès, le rollback avec maintien du statut d'échec, l'échec initial sans version précédente et les chemins contenant espaces et apostrophes. Ce rejeu ne prouve aucune connexion au serveur réel. Aucun workflow GitHub, push GHCR ou déploiement serveur n'a été exécuté pendant cette validation locale.
