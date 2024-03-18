import express from "express";
import mc from "minecraftstatuspinger";
import crypto from "node:crypto";
import nodemailer from "nodemailer";
import mariadb from "mariadb";
import "dotenv/config";

const port = process.env.PORT || 3000;
const dbName = process.env.DB_NAME || "mc_stats";

const pool = mariadb.createPool({
	host: process.env.DB_HOST,
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
			"CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, email VARCHAR(255), username VARCHAR(255), uuid VARCHAR(255), active BOOLEAN)",
		);
		await conn.query(
			"CREATE TABLE IF NOT EXISTS confirmations (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT, token VARCHAR(255))",
		);
		console.log("Database initialized");
	} catch (err) {
		console.error(err);
		console.log("Retrying in 30 seconds");
		setTimeout(seed, 30000);
	} finally {
		if (conn) conn.end();
	}
};
seed();

const app = express();
app.use(express.static("../frontend/dist")); // use public
app.use(express.json()); // to support JSON-encoded bodies
app.use(express.urlencoded({ extended: true })); // to support URL-encoded bodies

const transporter = nodemailer.createTransport({
	host: process.env.MAIL_HOST,
	port: process.env.MAIL_PORT,
	secure: process.env.MAIL_SSL === "true" ? true : false,
	auth: {
		user: process.env.MAIL_USER,
		pass: process.env.MAIL_PASS,
	},
});

app.post("/register", async (req, res) => {
	const userEmail = req.body.email.toLowerCase();

	if (!userEmail.endsWith("@chalmers.se")) {
		res.status(400).send("Invalid email");
		return;
	}

	const username = req.body.username.toLowerCase();

	// check that username is only letters and numbers or underscore
	if (!/^[a-z0-9_]+$/.test(username)) {
		res.status(400).send("Invalid username");
		return;
	}

	// check that username is under 64 characters
	if (username.length > 16) {
		res.status(400).send("Username is too long");
		return;
	}

	const response = await fetch(
		`https://api.mojang.com/users/profiles/minecraft/${username}`,
	);
	if (response.status === 404) {
		res.status(400).send("Username doesn't exist");
		return;
	}
	const uuid = await response.json().id;

	const token = crypto.randomBytes(32).toString("hex");

	let conn;
	try {
		conn = await pool.getConnection();

		// Check if email already exists
		let sql = "SELECT * FROM users WHERE email = ?";
		let rows = await conn.query(sql, [userEmail]);
		if (rows.length > 0) {
			res
				.status(400)
				.send(
					"Email already in use, search your inbox for a confirmation email or contact an admin for assistance",
				);
			return;
		}

		sql =
			"INSERT INTO users (email, username, uuid, active) VALUES (?, ?, ?, 0)";
		await conn.query(sql, [userEmail, username, uuid]);
		sql = "SELECT id FROM users WHERE email = ?";
		rows = await conn.query(sql, [userEmail]);
		const userId = rows[0].id;
		sql = "INSERT INTO confirmations (user_id, token) VALUES (?, ?)";
		await conn.query(sql, [userId, token]);
	} catch (err) {
		console.error(err);
	} finally {
		if (conn) conn.end();
	}

	// Send email with the token
	const mailOptions = {
		from: `"${process.env.MAIL_NAME}" <${process.env.MAIL_FROM}>`,
		to: userEmail,
		subject: "Registration Confirmation for mc.chs.se",
		text: `Hello,
Please confirm your registration by clicking the following link: http://${req.headers.host}/confirm/${token}

If you did not request this, please ignore this email.`,
	};

	transporter.sendMail(mailOptions, (err) => {
		if (err) {
			console.error("There was an error: ", err);
		} else {
			console.log("Email sent");
		}
	});

	res.send("Check your email for a confirmation link");
});

app.get("/confirm/:token", async (req, res) => {
	const token = req.params.token;
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
			res.send(`Your account has been activated. Redirecting to the home page...
      <script>
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      </script>`);
		} else {
			res.send("Invalid token. Try again. <a href='/'>Go to back</a>");
		}
	} catch (err) {
		console.error(err);
	} finally {
		if (conn) conn.end();
	}
});

app.get("/ping", async (_, res) => {
	try {
		const result = await mc.lookup({ host: "mc.chs.se" });
		res.send(result);
	} catch (error) {
		//server is offline
		res.send({ error: "Server is offline" });
	}
});

app.post("/check", async (req, res) => {
	const uuid = req.body.uuid;

	let conn;
	try {
		conn = await pool.getConnection();
		const sql = "SELECT * FROM users WHERE uuid = ?";
		const rows = await conn.query(sql, [uuid]);
		if (rows.length > 0) {
			res.send({ status: rows[0].active ? "success" : "denied" });
		} else {
			res.send({ status: "denied" });
		}
	} catch (err) {
		console.error(err);
		res.send({ status: "denied" });
	} finally {
		if (conn) conn.end();
	}
});

app.listen(port, () => {
	console.log(`App listening at http://localhost:${port}`);
});
