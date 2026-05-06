class User {
    constructor(email, password) {
        this.email = email;
        this.password = password;
    }
}

// Hardcoded user instance
const hardcodedUser = new User("admin@pedidiosahora.com", "password123");

module.exports = { User, hardcodedUser };