const { checkValidationRules, sendResponse } = require("../../../../../middleware/validatorHelper");
const STATUS = require("../../../../../utils/statusCodes");
const RULES = require("../../../../../utils/validationRules");
const authModel = require("../models/authModel");

exports.login = async (req, res) => {

    const request = req.body;

    const validate = {
        email: RULES.email,
        password: RULES.password,
    }

    const valid = await checkValidationRules(request, validate);
    if (valid.status) {
        return authModel.login(request, res)
    } else {
        return sendResponse(res, STATUS.VALIDATION_ERROR, valid.error || "Validation error", null);
    }

}

exports.userDetails = async (req, res) => {

    const request = { ...req.body, user_id: req.params.id };
    const validate = {
        user_id: RULES.user_id,
    }

    const valid = await checkValidationRules(request, validate);
    console.log("Validation result:", valid);
    if (valid.status) {
        return authModel.userDetails(request, res)
    } else {
        return sendResponse(res, STATUS.VALIDATION_ERROR, valid.error || "Validation error", null);
    }

}

exports.signup = async (req, res) => {

    const request = req.body;

    const validate = {
        name: RULES.name,
        email: RULES.email,
        password: RULES.password,
    }

    const valid = await checkValidationRules(request, validate);

    if (valid.status) {
        return authModel.signup(request, res)
    } else {
        return sendResponse(res, STATUS.VALIDATION_ERROR, valid.error || "Validation error", null);
    }

}

