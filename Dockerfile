FROM node:24-alpine3.21 AS base
WORKDIR /app
USER node

FROM base AS development
ENV NODE_ENV=development
USER root

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY prisma.config.ts ./
COPY src/infrastructure/database/prisma ./src/infrastructure/database/prisma
RUN yarn prisma generate

USER node
COPY --chown=node:node . .
EXPOSE 3000
CMD ["yarn", "start:dev"]

FROM base AS build
ENV NODE_ENV=production
USER root

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

USER node
COPY --chown=node:node . .
RUN yarn build

FROM base AS production
ENV NODE_ENV=production
COPY --from=build --chown=node:node /app/dist ./dist
USER root

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production && yarn cache clean

COPY prisma.config.ts ./
COPY src/infrastructure/database/prisma ./src/infrastructure/database/prisma
RUN yarn prisma generate

USER node
EXPOSE 3000
CMD ["yarn", "start:prod"]