FROM node:22.23.4-bookworm-slim

ARG TARGETARCH
ARG GH_VERSION=2.103.3
ARG CLOUDFLARED_VERSION=2026.10.3
ARG RUNNER_VERSION=2.338.2

USER root
RUN apt-get update && apt-get install -y --no-install-recommends \
    bash ca-certificates curl git jq nano openssl python3 python3-venv \
    libatomic1 libicu72 libssl3 libkrb5-3 zlib1g liblttng-ust1 \
    && rm -rf /var/lib/apt/lists/*
RUN npm install --global pnpm@10.20.0

RUN set -eu; \
    case "$TARGETARCH" in \
      amd64) runner_arch=x64; \
        gh_sha=4c806978ffce1cec70853302a56d70ac6da4f19bae7adca4e1a8ab00633dd91d; \
        cf_sha=053b80b0a23031a038fdbf3c073f59f82b8f1f152aa67971d7383ffafc0dbab0; \
        runner_sha=baebf204307bac6193480852732f0aba2ae97b6c5597c244f4d5558390147c40 ;; \
      arm64) runner_arch=arm64; \
        gh_sha=ee32df2323c8847f5fac6cb6b4b69ca75828e9329a8f22f677021f7b3306ce63; \
        cf_sha=89297ebfb9e8c99c0dc013a1140601453cf3798d8306c5591651f4a3f5210be8; \
        runner_sha=670adb2f268fe21dcbb58b3db0e0aa9d5b3bddfe2c651481336e561ff86de945 ;; \
      *) echo "Arquitectura no soportada: $TARGETARCH" >&2; exit 1 ;; \
    esac; \
    curl -fSL "https://github.com/cli/cli/releases/download/v${GH_VERSION}/gh_${GH_VERSION}_linux_${TARGETARCH}.tar.gz" -o /tmp/gh.tgz; \
    echo "$gh_sha  /tmp/gh.tgz" | sha256sum -c -; \
    tar -xzf /tmp/gh.tgz -C /tmp; \
    install -m 0755 "/tmp/gh_${GH_VERSION}_linux_${TARGETARCH}/bin/gh" /usr/local/bin/gh; \
    curl -fSL "https://github.com/cloudflare/cloudflared/releases/download/${CLOUDFLARED_VERSION}/cloudflared-linux-${TARGETARCH}" -o /tmp/cloudflared; \
    echo "$cf_sha  /tmp/cloudflared" | sha256sum -c -; \
    install -m 0755 /tmp/cloudflared /usr/local/bin/cloudflared; \
    mkdir -p /opt/actions-runner; \
    curl -fSL "https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-${runner_arch}-${RUNNER_VERSION}.tar.gz" -o /tmp/runner.tgz; \
    echo "$runner_sha  /tmp/runner.tgz" | sha256sum -c -; \
    tar -xzf /tmp/runner.tgz -C /opt/actions-runner; \
    rm -rf /tmp/gh.tgz "/tmp/gh_${GH_VERSION}_linux_${TARGETARCH}" /tmp/cloudflared /tmp/runner.tgz

ARG WORKSHOP_UID=1000
ARG WORKSHOP_GID=1000
RUN set -eu; \
    for value in "$WORKSHOP_UID" "$WORKSHOP_GID"; do \
      case "$value" in \
        ''|*[!0-9]*) echo "WORKSHOP_UID y WORKSHOP_GID deben ser enteros positivos." >&2; exit 1 ;; \
      esac; \
      case "$value" in \
        *[1-9]*) ;; \
        *) echo "WORKSHOP_UID y WORKSHOP_GID deben ser mayores que cero." >&2; exit 1 ;; \
      esac; \
    done; \
    groupmod --non-unique --gid "$WORKSHOP_GID" node; \
    usermod --uid "$WORKSHOP_UID" --gid node node; \
    mkdir -p /workspace /home/node/.hermes /home/node/.local/share/pnpm/store; \
    chown -R node:node /home/node /workspace /opt/actions-runner
ENV PATH="/home/node/.local/bin:${PATH}" \
    npm_config_store_dir="/home/node/.local/share/pnpm/store"
WORKDIR /workspace
USER node
RUN node --version && pnpm --version && gh --version && cloudflared --version

# Hermes lo incorpora el instructor durante la preparación/live setup.
# No hay credenciales ni un runner registrado dentro de la imagen.
CMD ["bash"]
