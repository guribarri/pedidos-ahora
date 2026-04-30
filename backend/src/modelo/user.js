class User {
    constructor(email, password) {
        this.email = email;
        this.password = password;
    }
}

// Hardcoded user instance
const hardcodedUser = new User("admin@example.com", "securepassword123");

module.exports = { User, hardcodedUser };