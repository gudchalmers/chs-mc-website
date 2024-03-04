# CHS MC Website

This is the CHS MC website that can be found here [mc.chs.se](https://mc.chs.se/).

The source code for the old CHS MC website can be found here on [github](https://github.com/gudchalmers/chs-mc-website/tree/aa622740b57cfc073a5d3f4b9321ecb184ad7804).

## Development
### Backend
```shell script
cd frontend
npm install
npm run prod

cd ..
cd backend
npm install
npx nodemon index.js
```

### Frontend
```shell script
cd backend
npm install
node .
cd ..
cd frontend
npm install
npm run dev
```

## Deployment

Using docker-compose:

```yml
version: '3'

services:
  chs-mc-website:
    image: ghcr.io/gudchalmers/chs-mc-website:main
    container_name: chs-mc-website
    restart: unless-stopped
    ports:
      - "3000:3000"
```

Copy the latest version of the dynmap website files from the plugin folder to the `public/dynmap` folder.

## License

[MIT](https://choosealicense.com/licenses/mit/)