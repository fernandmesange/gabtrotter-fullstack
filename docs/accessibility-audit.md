# Revue d'accessibilite - collecte Gabtrotter

Date de la revue : 23 aout 2026.

## Perimetre verifie

- Application Flutter : notice de confidentialite, decision directe du repondant, controles de formulaire, etats de connexion et boutons d'action.
- Interface web publique : information de fermeture et formulaire d'exercice des droits.
- Verification automatisee Flutter sur une largeur de 320 pixels avec texte agrandi a 200 %.
- Verification visuelle web a 1440 x 900 et 320 x 568.

## Mesures implementees

- Titres structures et noms accessibles pour les controles.
- Etats importants annonces comme regions dynamiques.
- Libelles persistants, texte explicite et icones decoratives masquees aux lecteurs d'ecran.
- Focus clavier visible sur le web.
- Cibles tactiles de 48 pixels minimum sur le parcours verifie.
- Contrastes testes automatiquement pour la notice mobile.
- Mise en page sans debordement horizontal ni texte tronque sur les deux largeurs web controlees.
- Choix de date adapte au grossissement du texte et boutons critiques utilisables sans geste complexe.
- Information explicite sur la localisation et consentement ou prise de connaissance effectue directement par le repondant.

## Resultats techniques

- `flutter analyze` : aucune anomalie.
- Tests Flutter : 6 tests valides, dont contraste, libelles, tailles des cibles, texte a 200 %, consentement explicite, chiffrement et minimisation de la localisation.
- Build web Vite : valide.
- Audit DOM web cible : aucun controle sans nom accessible, aucune largeur superieure au viewport a 320 pixels, aucune cible interactive inferieure a 48 pixels sur le formulaire public.

## Limites restantes

- Aucun audit complet par un organisme independant n'a ete realise.
- Les parcours TalkBack et VoiceOver doivent encore etre testes sur des appareils physiques avec des utilisateurs.
- La navigation clavier, les contrastes et le grossissement doivent etre audites sur les anciennes pages d'administration qui ne font pas partie du parcours public actuellement affiche.
- Les contenus de chaque futur questionnaire restent a controler : formulation, ordre des questions, alternatives aux contenus et comprehension en langage clair.
- L'accessibilite des documents exportes, des courriels et des services tiers n'est pas couverte par cette revue.

Ces travaux ameliorent la conformite technique du perimetre teste, mais ne constituent ni une certification WCAG, ni une declaration de conformite RGAA, ni une garantie de conformite a l'European Accessibility Act.
