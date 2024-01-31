# Installation Thingsboard

Cloner ce dépôt puis suivre le tuto de thingsboard : https://thingsboard.io/docs/user-guide/install/cluster/docker-compose-setup

Pour l'instant il faut cloner tout le dépôt puis suivre le tuto depuis le dossier `<depot>`/docker
A savoir qu'il faut l'image masteris/tb-web-ui plutôt que celle de Thingsboard car le frontend est customisé

TODO : dépôt avec seulement le dossier docker comme dans le tuto de thingsboard ?

# Gestion frontend custom

TODO : gestion du casse-tête de maven pour générer l'image docker...

# Upgrade Thingsboard

Pour faire un upgrade, il faut d'abord pull les nouvelles images à la bonne version.
Il faut également pull l'image du front custom (aujourd'hui via un `docker image load --input=<file>`).

Ensuite, modifier la version de TB dans le fichier .env (tjr dans le dossier docker).
