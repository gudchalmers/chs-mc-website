FROM node:20 as node-build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run production

FROM composer:2 as composer-build
WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install --no-dev


FROM php:8.2-apache as run

RUN docker-php-ext-install mysqli pdo pdo_mysql

COPY --from=node-build /app/public /var/www/html
COPY --from=composer-build /app/vendor /var/www/vendor
COPY app /var/www/app


WORKDIR /var/www/html

EXPOSE 80