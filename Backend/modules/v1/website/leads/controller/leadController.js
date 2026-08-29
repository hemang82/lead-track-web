const { checkValidationRules, sendResponse } = require("../../../../../middleware/validatorHelper");
const STATUS = require("../../../../../utils/statusCodes");
const RULES = require("../../../../../utils/validationRules");
const leadModel = require("../models/leadModel");

exports.createLead = async (req, res) => {

    const request = req.body;

    const validate = {
        user_id: RULES.user_id,
        email: RULES.email,
        name: RULES.name,
        phone: RULES.phone,
        source: RULES.source,
        description: RULES.description,
        status: RULES.status
    }

    const valid = await checkValidationRules(request, validate);
    if (valid.status) {
        return leadModel.createLead(request, res)
    } else {
        return sendResponse(res, STATUS.VALIDATION_ERROR, valid.error || "Validation error", null);
    }

}

exports.updateLead = async (req, res) => {

    const request = { ...req.body, lead_id: req.params.id };

    const validate = {
        lead_id: RULES.lead_id
    };

    if (request.email !== undefined) validate.email = RULES.email;
    if (request.name !== undefined) validate.name = RULES.name;
    if (request.phone !== undefined) validate.phone = RULES.phone;
    if (request.source !== undefined) validate.source = RULES.source;
    if (request.description !== undefined) validate.description = RULES.description;
    if (request.status !== undefined) validate.status = RULES.status;

    const valid = await checkValidationRules(request, validate);

    if (valid.status) {
        return leadModel.updateLead(request, res)
    } else {
        return sendResponse(res, STATUS.VALIDATION_ERROR, valid.error || "Validation error", null);
    }
}

exports.deleteLead = async (req, res) => {
    const request = { lead_id: req.params.id };

    const validate = {
        lead_id: RULES.lead_id
    };

    const valid = await checkValidationRules(request, validate);

    if (valid.status) {
        return leadModel.deleteLead(request, res)
    } else {
        return sendResponse(res, STATUS.VALIDATION_ERROR, valid.error || "Validation error", null);
    }
}

exports.getAllLeads = async (req, res) => {
    const request = req.query || {};

    const validate = {
        user_id: request.user_id ? RULES.user_id : "",
        status: request.status ? RULES.status : "",
        search: request.search ? "string" : "",
        page: request.page ? "integer|min:1" : "",
        per_page: request.per_page ? "integer|min:1" : ""
    };
    const valid = await checkValidationRules(request, validate);

    if (valid.status) {
        return leadModel.getAllLeads(request, res)
    } else {
        return sendResponse(res, STATUS.VALIDATION_ERROR, valid.error || "Validation error", null);
    }
}

exports.getLeadDetails = async (req, res) => {
    const request = { lead_id: req.params.id };

    const validate = {
        lead_id: RULES.lead_id
    };

    const valid = await checkValidationRules(request, validate);

    if (valid.status) {
        return leadModel.getLeadDetails(request, res)
    } else {
        return sendResponse(res, STATUS.VALIDATION_ERROR, valid.error || "Validation error", null);
    }
}

exports.addNote = async (req, res) => {
    const request = { ...req.body, lead_id: req.params.id };

    const validate = {
        lead_id: RULES.lead_id,
        user_id: RULES.user_id,
        content: "required|string"
    };

    const valid = await checkValidationRules(request, validate);

    if (valid.status) {
        return leadModel.addNote(request, res)
    } else {
        return sendResponse(res, STATUS.VALIDATION_ERROR, valid.error || "Validation error", null);
    }
}

exports.updateNote = async (req, res) => {
    const request = { ...req.body, note_id: req.params.note_id };

    const validate = {
        note_id: RULES.note_id,
        content: "required|string"
    };

    const valid = await checkValidationRules(request, validate);

    if (valid.status) {
        return leadModel.updateNote(request, res)
    } else {
        return sendResponse(res, STATUS.VALIDATION_ERROR, valid.error || "Validation error", null);
    }
}

exports.deleteNote = async (req, res) => {
    const request = { note_id: req.params.note_id };

    const validate = {
        note_id: "required|integer"
    };

    const valid = await checkValidationRules(request, validate);

    if (valid.status) {
        return leadModel.deleteNote(request, res)
    } else {
        return sendResponse(res, STATUS.VALIDATION_ERROR, valid.error || "Validation error", null);
    }
}

exports.getNotesByLead = async (req, res) => {

    const request = { lead_id: req.params.id };

    const validate = {
        lead_id: RULES.lead_id
    };

    const valid = await checkValidationRules(request, validate);

    if (valid.status) {
        return leadModel.getNotesByLead(request, res)
    } else {
        return sendResponse(res, STATUS.VALIDATION_ERROR, valid.error || "Validation error", null);
    }

}

exports.getDashboardStats = async (req, res) => {
    const request = req.query || {};

    const validate = {
        user_id: request.user_id ? RULES.user_id : ""
    };

    const valid = await checkValidationRules(request, validate);

    if (valid.status) {
        return leadModel.getDashboardStats(request, res)
    } else {
        return sendResponse(res, STATUS.VALIDATION_ERROR, valid.error || "Validation error", null);
    }
}