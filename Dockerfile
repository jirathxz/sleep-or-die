# Stage 1: Build Frontend Assets with Node.js
FROM node:22-alpine AS frontend-builder

WORKDIR /app

COPY package*.json ./
RUN npm ci || npm install

COPY . .
RUN npm run build

# Stage 2: Production PHP-FPM + Nginx Environment
FROM php:8.3-fpm-alpine

# Install system dependencies & build tools
RUN apk add --no-cache \
    nginx \
    git \
    curl \
    zip \
    unzip \
    postgresql-dev \
    sqlite-dev \
    libzip-dev \
    icu-dev \
    oniguruma-dev \
    linux-headers

# Install required PHP extensions for Laravel & PostgreSQL/SQLite
RUN docker-php-ext-install \
    pdo \
    pdo_pgsql \
    pdo_sqlite \
    bcmath \
    opcache \
    zip \
    intl \
    mbstring

# Configure PHP OPcache for production
RUN echo "opcache.enable=1" >> /usr/local/etc/php/conf.d/docker-php-ext-opcache.ini \
    && echo "opcache.enable_cli=1" >> /usr/local/etc/php/conf.d/docker-php-ext-opcache.ini \
    && echo "opcache.memory_consumption=128" >> /usr/local/etc/php/conf.d/docker-php-ext-opcache.ini \
    && echo "opcache.interned_strings_buffer=8" >> /usr/local/etc/php/conf.d/docker-php-ext-opcache.ini \
    && echo "opcache.max_accelerated_files=10000" >> /usr/local/etc/php/conf.d/docker-php-ext-opcache.ini \
    && echo "opcache.validate_timestamps=0" >> /usr/local/etc/php/conf.d/docker-php-ext-opcache.ini

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy application source code
COPY . .

# Copy built frontend assets from frontend-builder
COPY --from=frontend-builder /app/public/build ./public/build

# Install production PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist

# Configure Nginx
COPY docker/nginx.conf /etc/nginx/http.d/default.conf

# Setup Entrypoint
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Expose Render standard port
EXPOSE 10000

ENTRYPOINT ["entrypoint.sh"]
