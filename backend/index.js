import express from 'express';
import mc from "minecraftstatuspinger";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const app = express();
const port = 3000;
const currentFilePath = fileURLToPath(import.meta.url);
const currentDirPath = dirname(currentFilePath);

// use public
app.use(express.static('../frontend/public'));

app.get('/', (req, res) => {
  const filePath = path.join(currentDirPath, 'views', 'home.html');
  res.sendFile(filePath);
});

app.get('/ping', async (_, res) => {
  try {
    let result = await mc.lookup({ host: "mc.chs.se" });
    res.send(result);
  } catch (error) {
    res.status(500).send("An error occurred while pinging the server.");
  }
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});