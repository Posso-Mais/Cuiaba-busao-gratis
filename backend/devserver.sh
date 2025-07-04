#!/bin/sh
set -e
# Use Gunicorn para produção (Render) e Flask para desenvolvimento local
if [ "$RENDER" = "true" ] || [ "$FLASK_ENV" = "production" ]; then
  exec gunicorn --bind 0.0.0.0:${PORT:-3000} main:app
else
  python -u -m flask --app main run --host=0.0.0.0 --port=${PORT:-3000} --debug
fi