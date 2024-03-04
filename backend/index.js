import express from "express";
import mc from "minecraftstatuspinger";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import crypto from "crypto";
import nodemailer from "nodemailer";
import mariadb from "mariadb";
import "dotenv/config";

const port = process.env.PORT || 3000;
const dbName = process.env.DB_NAME || "mc_stats";

const pool = mariadb.createPool({
  host: "localhost",
  user: process.env.DB_USER,
  database: dbName,
  password: process.env.DB_PASS,
  connectionLimit: 5,
});

// seed db
const seed = async () => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    await conn.query(`USE ${dbName}`);
    await conn.query(
      `CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, email VARCHAR(255), username VARCHAR(255), active BOOLEAN)`
    );
    await conn.query(
      `CREATE TABLE IF NOT EXISTS confirmations (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT, token VARCHAR(255))`
    );
  } catch (err) {
    console.error(err);
  } finally {
    if (conn) conn.end();
  }
};
seed();

const app = express();
const currentFilePath = fileURLToPath(import.meta.url);
const currentDirPath = dirname(currentFilePath);

app.use(express.static("../frontend/public")); // use public
app.use(express.json()); // to support JSON-encoded bodies
app.use(express.urlencoded({ extended: true })); // to support URL-encoded bodies

app.get("/", (req, res) => {
  const filePath = path.join(currentDirPath, "home.html");
  res.sendFile(filePath);
});

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

app.post("/register", async (req, res) => {
  let userEmail = req.body.email;
  let username = req.body.username;

  let token = crypto.randomBytes(32).toString("hex");

  // Send email with the token
  let mailOptions = {
    from: `"${process.env.MAIL_NAME}>" <${process.env.MAIL_FROM}>`,
    to: userEmail,
    subject: "Registration Confirmation for mc.chs.se",
    text:
      "Please confirm your registration by clicking the following link: \nhttp://" +
      req.headers.host +
      "/confirm/" +
      token +
      "\n\n" +
      "If you did not request this, please ignore this email.",
  };

  transporter.sendMail(mailOptions, function (err) {
    if (err) {
      console.error("There was an error: ", err);
    } else {
      console.log("Email sent");
    }
  });

  let conn;
  try {
    conn = await pool.getConnection();
    let sql = "INSERT INTO users (email, username, active) VALUES (?, ?, 0)";
    await conn.query(sql, [userEmail, username]);
    sql = "SELECT id FROM users WHERE email = ?";
    const rows = await conn.query(sql, [userEmail]);
    let userId = rows[0].id;
    sql = "INSERT INTO confirmations (user_id, token) VALUES (?, ?)";
    await conn.query(sql, [userId, token]);
  } catch (err) {
    console.error(err);
  } finally {
    if (conn) conn.end();
  }
});

app.get("/confirm/:token", async (req, res) => {
  let token = req.params.token;
  let conn;
  try {
    conn = await pool.getConnection();
    let sql = "SELECT user_id FROM confirmations WHERE token = ?";
    const rows = await conn.query(sql, [token]);
    if (rows.length) {
      // If the token exists, delete it from the database and set the user to active
      sql = "DELETE FROM confirmations WHERE token = ?";
      await conn.query(sql, [token]);
      sql = "UPDATE users SET active = 1 WHERE id = ?";
      await conn.query(sql, [rows[0].user_id]);
      res.send("Your account has been activated.");
    } else {
      res.send("Invalid token.");
    }
  } catch (err) {
    console.error(err);
  } finally {
    if (conn) conn.end();
  }
});

app.get("/ping", async (_, res) => {
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
