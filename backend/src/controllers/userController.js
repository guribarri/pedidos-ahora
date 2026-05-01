const { object, string } = require("yup");
const { hardcodedUser } = require("../modelo/user.js");
const pool = require("../db");

const registerBodySchema = object({
  email: string().email().required(),
  password: string().required(),
})
  .noUnknown(true)
  .strict();

class UserController {
  async login (req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "email and password are required" });
      return;
    }

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    if (user.password !== password) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Return only the user email in the response
    res.json({ user: { email: user.email } });
  }
}

module.exports = UserController;