const STATUS = require("../../../../../utils/statusCodes");
const db = require('../../../../../config/db');
const { sendResponse } = require("../../../../../middleware/validatorHelper");
const moment = require('moment');

const authModel = {

    login: async (req, res) => {
        try {

            const stmt = db.prepare('SELECT * FROM users WHERE email = @email AND is_delete = 0 AND is_active = 1');
            const user = stmt.get({ email: req.email });

            if (!user) {
                return sendResponse(res, STATUS.ERROR, "Email address not found ", null);
            }

            if (user.password !== req.password) {
                return sendResponse(res, STATUS.ERROR, "Invalid password", null);
            }

            const userDetails = await authModel.getUserById(user.id);

            console.log("User details retrieved:", userDetails);
            if (!userDetails) {
                return sendResponse(res, STATUS.ERROR, "Login failed", userDetails);
            }

            return sendResponse(res, STATUS.OK, "Login successful", userDetails);

        } catch (error) {
            console.error("Login error:", error);
            return sendResponse(res, STATUS.ERROR, "Something went wrong ", null);
        }
    },

    signup: async (req, res) => {
        try {
            const checkUniqueEmail = await authModel.checkUniqueEmail(req);

            if (checkUniqueEmail) {
                return sendResponse(res, STATUS.ERROR, "Email already exists", null);
            }

            const stmt = db.prepare('INSERT INTO users (name, email, password, created_at, updated_at) VALUES (@name, @email, @password, @created_at, @updated_at)');

            const insertParam = {
                email: req.email,
                name: req.name,
                password: req.password,
                created_at: moment().utc().format("YYYY-MM-DD HH:mm:ss"),
                updated_at: moment().utc().format("YYYY-MM-DD HH:mm:ss")
            }

            const response = stmt.run(insertParam);

            const userDetails = await authModel.getUserById(response.lastInsertRowid);
            if (!userDetails) {
                return sendResponse(res, STATUS.ERROR, "Signup failed", null);
            }

            return sendResponse(res, STATUS.CREATED, "Signup successful", userDetails);

        } catch (error) {
            console.error("Signup error:", error);
            return sendResponse(res, STATUS.ERROR, "Something went wrong", null);
        }
    },

    userDetails: async (req, res) => {
        try {

            const userDetails = await authModel.getUserById(req.user_id);

            if (!userDetails) {
                return sendResponse(res, STATUS.ERROR, "User details not found", null);
            }

            return sendResponse(res, STATUS.OK, "User details retrieved successfully", userDetails);

        } catch (error) {
            console.error("User details error:", error);
            return sendResponse(res, STATUS.ERROR, "Something went wrong", null);
        }
    },

    checkUniqueEmail: (request) => {
        try {
            console.log("Checking unique email:", request.email);
            const stmt = db.prepare('SELECT email FROM users WHERE email = @email AND is_delete = 0');
            const user = stmt.get({ email: request.email });
            console.log("User found:", user);
            if (user) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error("Email check karvama error aavi:", error.message);
            return false;
        }
    },

    getUserById: (userId) => {
        try {
            const stmt = db.prepare('SELECT id, name, email, is_active, is_delete FROM users WHERE id = @id AND is_delete = 0');
            const user = stmt.get({ id: userId });

            if (user) {
                return user;
            } else {
                return null;
            }
        } catch (error) {
            console.error("User get karvama error:", error.message);
            return false;
        }
    }

}

module.exports = authModel;
