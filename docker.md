# Docker Development Setup

This guide uses the existing MeFolio application. Do not create a new Meteor app.

## Requirements

- Git and Docker Engine with Docker Compose v2 (Docker Desktop on Windows/macOS).
- On Windows, enable Docker Desktop's WSL2 Linux-container backend.
- Start Docker before running Compose commands.

## Start MeFolio

1. Clone the repository and open a terminal in `mefolio`.
2. Copy `server/oauth-login/oauth.settings.example.json` to `server/oauth-login/oauth.settings.json`. Enter authorised OAuth credentials locally; never commit secrets.
3. Run `docker compose up --build` for the first start, or `docker compose up` subsequently.
4. Open <http://localhost:3000>.

MongoDB Compass can connect to `mongodb://localhost:3001/meteor`. Inside the Compose network, the application uses `mongodb://mongo:27017/meteor`.

The Dockerfile uses a Node 20 base image and runs Meteor's development server with the local OAuth settings file. This setup is not a hardened production deployment.

## Check and Stop

```sh
docker compose ps
docker compose logs --tail=100 app mongo
docker compose stop
docker compose start
docker compose down
```

`stop` stops containers without removing them. `down` removes containers and the network but preserves named volumes. `docker compose down -v` deletes named volumes, including the MongoDB data; do not use it unless that data is disposable or a verified backup exists.

If a port is occupied, stop the conflicting service or change only the host side of the Compose port mapping. If Docker cannot connect to its daemon, check that Docker Desktop/Engine is running. If a dependency remains missing after an image rebuild, the persistent `node_modules` volume may need its dependencies refreshed; inspect the app logs before changing volumes.

See [README.md](README.md) for handover and deployment information and [MAINTENANCE_PLAN.md](MAINTENANCE_PLAN.md) for post-Week-12 operations.