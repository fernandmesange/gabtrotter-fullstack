# Procedure de gestion d'une violation de donnees personnelles

Statut : procedure operationnelle a faire valider par le responsable du traitement. Elle ne remplace pas une analyse juridique de l'obligation de notification.

## Declenchement

Tout soupcon de perte de confidentialite, d'integrite ou de disponibilite est traite comme un incident : appareil perdu, compte compromis, export transmis au mauvais destinataire, acces anormal, suppression accidentelle, fuite de cle ou synchronisation alteree.

## Roles

- Le declarant conserve les premiers faits sans copier de donnees personnelles dans Trello ou Slack.
- Le responsable technique contient l'incident, preserve les journaux et evalue les systemes touches.
- Le responsable du traitement decide, avec le conseil competent, des notifications a l'autorite et aux personnes concernees.
- Une seule personne est chargee des communications externes afin d'eviter des messages contradictoires.

## Chronologie cible

1. Dans les 4 heures : ouvrir le registre, attribuer un identifiant, noter l'heure de detection, contenir l'acces, revoquer les sessions ou secrets exposes et preserver les preuves.
2. Dans les 24 heures : qualifier les categories de donnees, le nombre approximatif de personnes et d'enregistrements, la duree d'exposition, les destinataires possibles et les consequences plausibles.
3. Avant 72 heures lorsque le droit applicable l'exige : documenter la decision de notifier ou de ne pas notifier, puis transmettre les informations disponibles a l'autorite competente. Completer ensuite si l'enquete continue.
4. Sans retard injustifie lorsqu'un risque eleve est retenu : informer les personnes avec un langage clair, les consequences probables, les mesures prises et un contact utile.
5. Apres retablissement : verifier les donnees, surveiller les acces, fermer l'incident et programmer les actions preventives.

## Registre minimal

Le registre contient : identifiant, detecteur, dates, systemes, donnees et personnes concernees, faits connus, niveau de risque, mesures de confinement, preuves preservees, decision de notification et justification, communications, restauration, cause racine, actions correctives, responsable et echeance. Les details sensibles sont conserves dans un emplacement chiffre a acces restreint.

## Regles techniques immediates

- Ne jamais supprimer ni modifier les journaux sources avant leur copie de preservation.
- Faire tourner les secrets et invalider les jetons lorsqu'une exposition est possible.
- Suspendre les exports et limiter le traitement des reponses concernees si necessaire.
- Verifier l'idempotence et la reconciliation des synchronisations avant reprise.
- Restaurer depuis une sauvegarde testee uniquement apres avoir ferme le vecteur d'attaque.

## Retour d'experience

Chaque incident donne lieu a une analyse de cause racine, une action testable, un responsable et une date cible. Un exercice sur table est organise au moins une fois par an. Cette procedure ne prouve aucune certification ni conformite reglementaire ; elle fournit un cadre de reaction et de tracabilite.
