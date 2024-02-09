# dApps staking indexer

## Prerequisites

- npm, node ≥ v16
- git
- docker
- docker-compose with docker user & group

This is the list of install commands of the prerequisites for Ubuntu 22.04 for the program list above.

```bash
# For node and npm
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
NODE_MAJOR=18
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list
sudo apt update
sudo apt install nodejs

# For docker
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin docker-compose
sudo gpasswd -a $USER docker
newgrp docker
```

## `sqd` CLI installation

```bash
sudo npm i -g @subsquid/cli
```

## Run

```bash
npm ci
sqd up
sqd process
```

to beging the ingestion, then start the GraphQL server in a separate terminal.

Also note that the endpoint & block range are stored in the `.env` file.

```bash
sqd serve
```

## Develop

### Types

When changes are made to the rpc types, use the following commands:

```bash
npm generate-metadata # for local node development
sqd typegen # operates on metadata or rpc and modifies types
```

### Schema

When you make changes to the schema, use the following commands:

```bash
sqd codegen
sqd build # modify your squid to use the new schema until it builds
sqd down; sqd up
sqd migration:generate # rerun everytime there is a change to the schema
```

This drops then re-creates the database and regenerates any migrations.

## Deploy to the aquarium

There are 3 manifests, one for each network: astar, shiden and shibuya.

```bash
sqd deploy . -r --org astar-network -m manifests/astar.yaml
```
