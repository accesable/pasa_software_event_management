## Installation

```bash
$ yarn install
```

## Running the app

```bash
# all service
$ yarn run start:all


## Tree structure

├── apps
│   ├── ticket-service
│   │   ├── test
│   │   │   ├── app.e2e-spec.ts
│   │   │   └── jest-e2e.json
│   │   ├── src
│   │   │   ├── config
│   │   │   │   └── env.validation.ts
│   │   │   ├── schemas
│   │   │   │   ├── participant.ts
│   │   │   │   └── ticket.ts
│   │   │   ├── main.ts
│   │   │   ├── ticket-service.controller.ts
│   │   │   ├── ticket-service.service.ts
│   │   │   └── ticket-service.module.ts
│   │   └── tsconfig.app.json
│   ├── report-service
│   │   ├── test
│   │   │   ├── app.e2e-spec.ts
│   │   │   └── jest-e2e.json
│   │   ├── src
│   │   │   ├── main.ts
│   │   │   ├── report-service.controller.ts
│   │   │   ├── report-service.service.ts
│   │   │   └── report-service.module.ts
│   │   └── tsconfig.app.json
│   ├── notification-service
│   │   ├── test
│   │   │   ├── app.e2e-spec.ts
│   │   │   └── jest-e2e.json
│   │   ├── src
│   │   │   ├── config
│   │   │   │   ├── mailer.config.ts
│   │   │   │   └── env.validation.ts
│   │   │   ├── mail
│   │   │   │   └── contants
│   │   │   │       └── template.ts
│   │   │   ├── main.ts
│   │   │   ├── notification-service.controller.ts
│   │   │   ├── notification-service.service.ts
│   │   │   └── notification-service.module.ts
│   │   └── tsconfig.app.json
│   ├── file-service
│   │   ├── test
│   │   │   ├── app.e2e-spec.ts
│   │   │   └── jest-e2e.json
│   │   ├── src
│   │   │   ├── config
│   │   │   │   └── env.validation.ts
│   │   │   ├── schemas
│   │   │   │   └── file.schema.ts
│   │   │   ├── main.ts
│   │   │   ├── file-service.controller.ts
│   │   │   ├── file-service.service.ts
│   │   │   └── file-service.module.ts
│   │   └── tsconfig.app.json
│   ├── event-service
│   │   ├── test
│   │   │   ├── app.e2e-spec.ts
│   │   │   └── jest-e2e.json
│   │   ├── src
│   │   │   ├── speaker
│   │   │   │   ├── schemas
│   │   │   │   │   └── speaker.schema.ts
│   │   │   │   ├── speaker.service.ts
│   │   │   │   └── speaker.module.ts
│   │   │   ├── guest
│   │   │   │   ├── schemas
│   │   │   │   │   └── guest.schema.ts
│   │   │   │   ├── guest.service.ts
│   │   │   │   └── guest.module.ts
│   │   │   ├── event-category
│   │   │   │   ├── schemas
│   │   │   │   │   └── event-category.schema.ts
│   │   │   │   ├── event-category.service.ts
│   │   │   │   └── event-category.module.ts
│   │   │   ├── event
│   │   │   │   ├── schemas
│   │   │   │   │   ├── question.schema.ts
│   │   │   │   │   ├── invite.schema.ts
│   │   │   │   │   └── event.schema.ts
│   │   │   │   ├── event.controller.ts
│   │   │   │   ├── event.service.ts
│   │   │   │   └── event.module.ts
│   │   │   ├── config
│   │   │   │   └── env.validation.ts
│   │   │   ├── main.ts
│   │   │   └── event-service.module.ts
│   │   └── tsconfig.app.json
│   ├── auth
│   │   ├── test
│   │   │   ├── app.e2e-spec.ts
│   │   │   └── jest-e2e.json
│   │   ├── src
│   │   │   ├── users
│   │   │   │   ├── schemas
│   │   │   │   │   └── user.schema.ts
│   │   │   │   ├── users.controller.ts
│   │   │   │   ├── users.service.ts
│   │   │   │   └── users.module.ts
│   │   │   ├── decorators
│   │   │   │   └── public.decorator.ts
│   │   │   ├── core
│   │   │   │   └── transform.interceptor.ts
│   │   │   ├── config
│   │   │   │   └── env.validation.ts
│   │   │   ├── main.ts
│   │   │   └── auth.module.ts
│   │   └── tsconfig.app.json
│   └── apigateway
│       ├── test
│       │   ├── app.e2e-spec.ts
│       │   └── jest-e2e.json
│       └── src
│           ├── users
│           │   ├── dto
│           │   │   ├── upgrade.ts
│           │   │   ├── register.ts
│           │   │   ├── profile.ts
│           │   │   ├── login.ts
│           │   │   └── change-password.ts
│           │   ├── core
│           │   │   └── rpc-exception.interceptor.ts
│           │   ├── users.controller.spec.ts
│           │   ├── users.controller.ts
│           │   ├── users.service.ts
│           │   └── users.module.ts
│           ├── ticket-service
│           │   ├── dto
│           │   │   └── create-participant.dto.ts
│           │   ├── ticket-service.controller.ts
│           │   ├── ticket-service.service.ts
│           │   └── ticket-service.module.ts
│           ├── strategies
│           │   ├── google.stategy.ts
│           │   └── jwt.strategy.ts
│           ├── report-service
│           │   ├── report-service.controller.ts
│           │   ├── report-service.service.ts
│           │   └── report-service.module.ts
│           ├── redis
│           │   ├── redis.service.ts
│           │   └── redis.module.ts
│           ├── notification
│           │   ├── notification.controller.ts
│           │   ├── notification.service.ts
│           │   └── notification.module.ts
│           ├── guards
│           │   ├── roles.guard.ts
│           │   ├── jwt-auth.guard.ts
│           │   └── google-auth
│           │       └── google-auth.guard.ts
│           ├── file-service
│           │   ├── file-service.service.ts
│           │   └── file-service.module.ts
│           ├── event-service
│           │   ├── dto
│           │   │   ├── update-event-service.dto.ts
│           │   │   ├── create-speaker.dto.ts
│           │   │   ├── create-guest.dto.ts
│           │   │   ├── create-event-service.dto.ts
│           │   │   └── create-event-category.dtc.ts
│           │   ├── event-service.controller.spec.ts
│           │   ├── event-service.controller.ts
│           │   ├── event-service.service.ts
│           │   └── event-service.module.ts
│           ├── decorators
│           │   └── public.decorator.ts
│           ├── constants
│           │   └── service.constant.ts
│           ├── config
│           │   └── env.validation.ts
│           ├── app.module.ts
│           └── main.ts
├── libs
│   └── common
│       └── src
│           ├── types
│           │   ├── ticket.ts
│           │   ├── report.ts
│           │   ├── notification.ts
│           │   ├── index.ts
│           │   ├── file.ts
│           │   ├── event.ts
│           │   └── auth.ts
│           └── filters
│               └── handleException.ts
├── webpack.config.js
├── tsconfig.json
├── tsconfig.build.json
├── README.md
├── package.json
├── nest-cli.json
└── docker-compose.yml
