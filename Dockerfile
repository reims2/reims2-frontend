FROM node:20.16.0@sha256:d3c8ababe9566f9f3495d0d365a5c4b393f607924647dd52e75bf4f8a54effd3 AS build

WORKDIR /usr/src/app
COPY .yarn/ .yarn/
COPY public/ public/
COPY src/ src/
COPY .yarnrc.yml .pnp.* index.html package.json yarn.lock tsconfig.json tsconfig.node.json vite.config.ts .browserslistrc ./

RUN yarn install --immutable

ARG GIT_VERSION=unknown
ENV VITE_GIT_VERSION=${GIT_VERSION}
RUN yarn build

# PROD IMAGE
FROM caddy:2.8.4-alpine@sha256:a5e86b169f1c895c30acd012b0b1ba1330d8092c2556d7569d9f184db285d395

COPY ./Caddyfile /etc/caddy/Caddyfile
COPY --from=build /usr/src/app/dist /usr/share/caddy

EXPOSE 5000
HEALTHCHECK --interval=5s --timeout=5s --retries=3 --start-period=15s CMD wget -nv -t1 --spider 'http://localhost:5000' || exit 1

