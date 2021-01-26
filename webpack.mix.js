let mix = require('laravel-mix');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for your application, as well as bundling up your JS files.
 |
 */

if (!mix.inProduction()) {
    mix.browserSync('localhost');
    mix.options({
        hmrOptions: {
            host: 'localhost',
            port: 8081
        }
    })
}

mix.extract();
mix.js('resources/js/app.js', 'public/js/')
    .sass('resources/scss/app.scss', '/css/')
    .copy('resources/images/*', 'public/images/')
    .setPublicPath('public');

if (mix.inProduction()) {
    mix.version();
}