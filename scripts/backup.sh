#!/usr/bin/env sh
set -eu

backup_dir="${AHANCHI_BACKUP_DIR:-./backups}"
timestamp="$(date +%Y%m%d_%H%M%S)"
mkdir -p "$backup_dir"
docker compose exec -T mongo mongodump --db ahanchi --archive --gzip > "$backup_dir/ahanchi_$timestamp.archive.gz"
echo "Backup created: $backup_dir/ahanchi_$timestamp.archive.gz"
