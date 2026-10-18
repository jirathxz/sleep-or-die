#!/bin/sh
set -e

echo "==> Starting SleepOrDie Production Entrypoint..."

# Ensure storage directories exist with proper permissions
mkdir -p /var/www/html/storage/framework/cache
mkdir -p /var/www/html/storage/framework/sessions
mkdir -p /var/www/html/storage/framework/views
mkdir -p /var/www/html/storage/logs
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# If SQLite is selected and database doesn't exist, create it
if [ "$DB_CONNECTION" = "sqlite" ] || [ -z "$DB_CONNECTION" ]; then
    if [ ! -f /var/www/html/database/database.sqlite ]; then
        echo "==> Creating empty SQLite database..."
        touch /var/www/html/database/database.sqlite
        chown www-data:www-data /var/www/html/database/database.sqlite
    fi
fi

# Run migrations safely
echo "==> Running Database Migrations..."
php artisan migrate --force --no-interaction || echo "Warning: Migration failed, continuing startup..."

# Cache configuration, routes, and views for production performance
echo "==> Optimizing Laravel Caches..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# If arguments passed, run custom command (e.g. for worker: php artisan schedule:work)
if [ "$#" -gt 0 ]; then
    echo "==> Executing custom container command: $@"
    exec "$@"
fi

# Start PHP-FPM in background
echo "==> Starting PHP-FPM..."
php-fpm -D

# Start Nginx in foreground
echo "==> Starting Nginx on port 10000..."
exec nginx -g "daemon off;"
