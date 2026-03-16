#!/usr/bin/env bash
set -euo pipefail

LABEL="com.gy.ivd-video-workflow"
PLIST_PATH="${HOME}/Library/LaunchAgents/${LABEL}.plist"

launchctl bootout "gui/$(id -u)/${LABEL}" >/dev/null 2>&1 || true
rm -f "${PLIST_PATH}"

echo "已移除 LaunchAgent: ${LABEL}"
