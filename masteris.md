# Installation Thingsboard

Cloner ce dépôt puis suivre le tuto de thingsboard : https://thingsboard.io/docs/user-guide/install/cluster/docker-compose-setup

Pour l'instant il faut cloner tout le dépôt puis suivre le tuto depuis le dossier `<depot>`/docker
A savoir qu'il faut l'image masteris/tb-web-ui plutôt que celle de Thingsboard car le frontend est customisé

TODO : dépôt avec seulement le dossier docker comme dans le tuto de thingsboard ?

# Build du frontend custom

## Sur PC de dev

### Il faut docker et maven
Pour docker, voir sur le web.  

Pour maven: `sudo apt install maven`  

```bash
# Depuis la racine du projet
mvn clean install -DskipTests -Ddockerfile.skip=false -pl ui-ngx -am
docker build msa/web-ui/target -t masteris/tb-web-ui:<VERSION>
docker save -o <savePath>.tar masteris/tb-web-ui:<VERSION>

# Puis faire une copie du .tar sur l'EC2 cible
```

## Sur l'EC2
```bash
docker image load --input=<savePath>.tar
```

# Upgrade Thingsboard

Pour faire un upgrade, il faut d'abord pull les nouvelles images à la bonne version.
Il faut également pull l'image du front custom (aujourd'hui via un `docker image load --input=<file>`).

Ensuite, modifier la version de TB dans le fichier .env (tjr dans le dossier docker).
