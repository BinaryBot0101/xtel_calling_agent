#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_DIR="${XTEL_INIT_WORKSPACE_DIR:-/workspace}"
OUTPUT_ROOT="${XTEL_INIT_OUTPUT_ROOT:-/generated}"
NGINX_OUTPUT_DIR="$OUTPUT_ROOT/nginx"
COTURN_OUTPUT_DIR="$OUTPUT_ROOT/coturn"
CERTS_DIR="${XTEL_INIT_CERTS_DIR:-/certs}"

# shellcheck disable=SC1091
. "$SCRIPT_DIR/lib/setup_common.sh"

XTEL_DEPLOY_PROJECT_DIR="$WORKSPACE_DIR"

mkdir -p "$NGINX_OUTPUT_DIR" "$COTURN_OUTPUT_DIR"

if [[ "${ENVIRONMENT:-local}" == "production" ]]; then
    xtel_validate_remote_runtime_env
    [[ -f "$CERTS_DIR/local.crt" ]] || xtel_fail "certs/local.crt not found"
    [[ -f "$CERTS_DIR/local.key" ]] || xtel_fail "certs/local.key not found"

    export TURN_EXTERNAL_IP="$SERVER_IP"
    xtel_render_remote_nginx_conf "$WORKSPACE_DIR" "$NGINX_OUTPUT_DIR/default.conf"
    xtel_render_remote_turn_conf "$WORKSPACE_DIR" "$COTURN_OUTPUT_DIR/turnserver.conf"
    xtel_success "✓ xtel-init rendered remote nginx and coturn config"
    exit 0
fi

if [[ -n "${TURN_SECRET:-}" && -n "${TURN_HOST:-}" ]]; then
    export TURN_EXTERNAL_IP="$TURN_HOST"
    xtel_render_remote_turn_conf "$WORKSPACE_DIR" "$COTURN_OUTPUT_DIR/turnserver.conf"
    xtel_success "✓ xtel-init rendered local TURN config"
    exit 0
fi

xtel_success "✓ xtel-init no-op for current profile"
