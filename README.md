# CHS MC Website

This is the CHS MC website that can be found here [mc.chs.se][1]

## Requirement

* Requires a database with a `mc_stats` table
* Webserver with php, [composer][2] and [nodejs][3]

## Setup

Rename the `.env.example` to `.env` and modify it to the current environment.

The site is served out of the `public` folder.

To setup the dev run:

```shell script
composer install
npm install
npm run dev
# or
npm run watch
```

To setup the production site run:

```shell script
composer install --optimize-autoloader --no-dev
npm install --production
npm run prod
```

Copy the latest version of the dynmap website files from the plugin folder to the `public/dynmap` folder.

## License

[MIT][4]

[1]: https://mc.chs.se/
[2]: https://getcomposer.org/
[3]: https://nodejs.org/
[4]: https://choosealicense.com/licenses/mit/