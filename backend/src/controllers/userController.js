import { object, string } from "yup";

import { hardcodedUser } from "../modelo/user.js";

const registerBodySchema = object({
  email: string().email().required(),
  password: string().required(),
})
  .noUnknown(true)
  .strict();

class UserController {

  login = (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "email and password are required" });
      return;
    }

    // Authenticate against the hardcoded user
    if (hardcodedUser.email !== email || hardcodedUser.password !== password) {
      res.status(400).json({ error: "Invalid credentials" });
      return;
    }

    // Return only the user email in the response
    res.json({ user: { email: hardcodedUser.email } });
  };

}

export default UserController;