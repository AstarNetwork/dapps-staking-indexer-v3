# dApps staking indexer

## `sqd` command installation

```bash
npm i -g @subsquid/cli
```
Can't be installed locally: has to be in `PATH`. You can avoid polluting your system by installing to home folder:
```bash
mkdir ~/global-node-packages
npm config set prefix ~/global-node-packages
```
then adding this line to `~/.bashrc`:
```bash
export PATH="${HOME}/global-node-packages/bin:$PATH"
```

## Run

```bash
npm ci
sqd up
sqd process
```
to beging the ingestion, then start the GraphQL server in a separate terminal
```bash
sqd serve
```

## Develop

On schema changes:
```bash
sqd codegen
sqd build # modify your squid to use the new schema until it builds
sqd down; sqd up
sqd migration:generate
```
This drops then re-creates the database and regenerates any migrations.
