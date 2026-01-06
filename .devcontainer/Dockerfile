FROM alpine:edge

RUN apk update && apk add --no-cache \
    nushell \
    curl \
    git \
    nodejs \
    pnpm

RUN adduser -D -s /usr/bin/nu runner
