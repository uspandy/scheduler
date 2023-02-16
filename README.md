# Scheduler

NestJS + Typescript example scheduler

## Description

A backend application for the staff scheduling system.
Users must be able to create an account and log in.
Implement 2 roles with different permission levels

- Staff User:
  - Can view his/her schedule for any period of time (up to 1 year)
  - Can see his/her coworker schedules
- Admin:
  - Can edit/delete all users,
  - Can create/edit/delete schedule for users
  - Can order users list by accumulated work hours per arbitrary period (up to 1 year).

Schedule should have:

- Work date
- User
- Shift length in hours

Deliverables:

- Create relevant REST endpoints that can be accessed and interacted via Postman or
other similar software.
- Add Relevant unit tests.
- Create a documentation page using Open API specifications.
- Dockerize application and add README file describing how to run the project.
- Upload your project to Github

Technologies to use:

- Node.js + NestJS
- Postgres
- Docker

Additional information

- For logon system uses pair email/password.
- Administrator has to confirm the newly created account before the user can log in.
- System have a mechanism to create the first administrator (default user, can be set in environment)
- Staff and admins have different endpoints for logon, registration, token refresh.
- System have a mechanism of staff users groups (currently there is only stub groups) and the user can see only his colleagues, not all users
- Only user with staff role can have his own schedule.
- An administrator can't delete himself (this excludes a risk of losing the last administrator)
- Session is blocked immediately after the user is deleted / blocked
- A deleted user can create an account again with the same email (with all of his schedules)
- System have partial audit of user related actions (create, update, delete) an audit of users
- System have logging system with partial performance info

TODO:

- Integration with third-party authentication systems (LDAP or other third party provider)
- Ability to create schedules that intersect in time for one user
- Add list of colleagues for staff user
- Finish a mechanism of staff users groups (add CRUD)
- Finish session storage (add CRUD + mechanism to session management)
- Finish audit of user related actions + add audit to Schedules actions
- Add prometheus metrics interceptor (errors, performance)
- Finish tests + use pg_mem

Based on:
[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
# Install dependencies
$ npm ci

# Copy environments
$ cp .env.sample.ini .env
```

## Running the app

### Start postgresql

Database env file:
`./docker_db/database.env`

```bash
# start container
$ docker-compose -f ./docker_db/docker-compose.yml up
```

### Start development mode

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev
```

## Build production version

### Create and start production instance via docker

```bash
# build and start container
$ docker-compose up

# build / re-build container
$ docker-compose build

# re-build and start container
$ docker-compose up --build
```

### Build production locally

```bash
# build production
$ npm run build

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
