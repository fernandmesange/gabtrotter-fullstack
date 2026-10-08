# Analyse d'impact relative a la protection des donnees - enquete de terrain

Statut : document de travail a faire valider par le responsable du traitement et, si necessaire, par un conseil juridique ou le delegue a la protection des donnees.

## Perimetre et finalites

L'analyse couvre l'application mobile de collecte hors ligne, l'API de synchronisation, le stockage central chiffre, l'interface de supervision et le dispositif d'exercice des droits. Le traitement sert a conduire des enquetes de terrain et a produire des resultats consolides pour une campagne determinee. Il n'a pas pour finalite la surveillance des agents ou des repondants.

## Acteurs

- Responsable du traitement : organisation indiquee dans la notice versionnee de la campagne.
- Personnes concernees : repondants aux enquetes.
- Utilisateurs habilites : agents de collecte, superviseurs et administrateurs selon leurs droits.
- Sous-traitants a recenser avant production : hebergeur, fournisseur de messagerie et tout prestataire ayant acces aux donnees.

## Donnees et cycle de vie

- Reponses aux formulaires et date de collecte.
- Identifiant technique de l'appareil et identifiant de soumission.
- Preuve d'information ou de consentement versionnee.
- Localisation uniquement si la campagne l'active explicitement, avec finalite, caractere obligatoire ou facultatif et precision configuree.
- Recu confidentiel : le secret est remis au repondant ; seul son condensat SHA-256 est conserve par l'API.
- Donnees chiffrees localement par AES-GCM puis dans la base centrale par AES-256-GCM.
- Effacement automatique selon la duree de conservation configuree ; traces de synchronisation conservees separement pour une duree limitee.

## Necessite et proportionnalite

La localisation est desactivee par defaut. Lorsqu'elle est activee, le responsable doit justifier la finalite et choisir la precision la moins intrusive. Une campagne qui n'autorise pas cette collecte rejette une reponse contenant des coordonnees. Les exports et consultations excluent les reponses dont le traitement est limite.

La notice indique au minimum le responsable, le contact, la finalite, la base de traitement, les destinataires, la conservation, les droits, les transferts, les consequences des champs obligatoires, l'existence ou non d'une decision automatisee et la politique de localisation. Le choix est confirme directement sur l'appareil par le repondant.

## Analyse des risques

| Risque | Impact | Mesures en place | Risque residuel et action |
|---|---|---|---|
| Perte ou vol d'un appareil hors ligne | Acces aux reponses | Chiffrement AES-GCM, code local sale, purge apres synchronisation | Verifier le verrouillage des appareils et documenter leur restitution |
| Interception pendant la synchronisation | Divulgation ou alteration | HTTPS en production, authentification, donnees chiffrees, controle de schema | Tester TLS et le renouvellement des certificats avant chaque campagne |
| Acces excessif d'un compte | Consultation non autorisee | Roles agent, superviseur et administrateur, controles horizontaux, journaux de synchronisation | Revue trimestrielle des comptes et des habilitations |
| Reidentification par localisation et reponses | Atteinte a la vie privee | Localisation desactivee par defaut, finalite et precision configurees | Interdire la localisation precise sans justification ecrite |
| Perte du recu confidentiel | Impossibilite pratique d'exercer un droit | Affichage non escamotable, copie possible, secret non stocke en clair au serveur | Prevoir une procedure d'identification alternative hors application |
| Suppression ou rectification incorrecte | Perte de preuve ou donnees inexactes | Validation par un administrateur, demande tracee, delai cible de 30 jours | Ajouter une revue a deux personnes pour les demandes sensibles |
| Violation non detectee | Retard de notification | Procedure d'incident et registre a tenir | Organiser un exercice annuel et definir les contacts d'astreinte |

## Decisions et conditions de mise en production

Avant une nouvelle campagne, le responsable doit valider la finalite, la base de traitement, la duree, les destinataires, les transferts, le besoin de localisation et les champs obligatoires. Il doit aussi verifier les contrats de sous-traitance, realiser un test de restauration, un test d'intrusion proportionne et une revue d'accessibilite avec des utilisateurs.

Cette analyse ne constitue ni une certification RGPD, ni une attestation de conformite WCAG. Les risques residuels et les validations doivent etre dates, signes et reevalues apres tout changement important.
