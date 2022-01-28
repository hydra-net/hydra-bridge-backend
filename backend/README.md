# Hydra bridge backend

Backend is made with NodeJS, Typescript and PostgreSql along with smart contracts in solidity.

## Setup

Install the latest version of NodeJS and Yarn.

Install the latest version of Postgres.

## Environment Variables

Copy `env.example` in `.env` and populate missing variables

## Folder Structure

### /

Root folder contains:

- `.editorconfig` that's configuration for any common editor
- `.env.example` witch is file example of `.env` file
- `.eslintrc.json` file that's configuration for eslint
- `.gitignore` contains all files and folders to ignore
- `.nvmrc` file that contains nvm version of node that's used in project
- `app.ts` app starting point
- `hardhat.config.ts` configuration for hardhat, development enviroment to compile, test, and debug Ethereum software. Check here https://hardhat.org/
- `package.json` npm configuration file
- `swagger.json` file that contains swagger OpenAPI specification
- `tsconfig.json` file that configures typescript for project
- `yarn.lock` file is main source of information about the current versions of dependencies in project
- `app-error.log` file that contains all logs, it's automatically generated on first error

### /api

This folder contains all code that's related to services

### /hardhat

This folder contains all code that's related to services

### /prisma

This folder contains all files realated to `Prisma ORM`

## Start app

use `yarn start`

## Linting

use `yarn lint`

# Smart contracts

This project uses Hardhat for local development.

Common commands:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
node scripts/sample-script.js
npx hardhat help
```

```bash
npx hardhat run hardhat/scripts/deployBridge.ts --network ropsten
```

# Database

This project uses `Prisma ORM`. Check more here: https://www.prisma.io/
Commands:

- Seed:

```bash
$ yarn prisma db seed
```

- Add migration and update db:

```bash
$ npx prisma migrate dev --name add_new_field
```

- Migrate:

```bash
$ npx prisma migrate add_new_field
```

## Specification

- api specification is defined in `swagger.json` file and when server starts specification is automatically generated

## Deployment

- installl Heroku CLI
- Deploy to heroku, go to root folder:

```bash
$ git subtree push --prefix backend heroku master
```

## Links

### API

The REST API can be accessed at `http://{host}:{port}/api/v1/{endpoint}`.

### Docs

Documents for the API are automatically generated. You can access them when the server is running by going to `http://{host}:{port}/swagger`
