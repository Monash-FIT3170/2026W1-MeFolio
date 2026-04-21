FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    build-essential \
    python3 \
    && rm -rf /var/lib/apt/lists/*

RUN curl https://install.meteor.com/ | sh

WORKDIR /app

ENV METEOR_WATCH_MODE=polling
ENV METEOR_ALLOW_SUPERUSER=true

COPY mefolio/. .

RUN meteor npm install

EXPOSE 3000

CMD ["meteor", "run", "--allow-superuser"]