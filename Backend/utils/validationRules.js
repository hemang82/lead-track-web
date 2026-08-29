module.exports = {
    name: "required|string",
    email: "required|email",
    password: "required",
    user_id : "required|integer",
    lead_id : "required|integer",
    note_id : "required|integer",
    phone : "required|string",
    source : "",
    description : "required|string",
    status: "in:new,contacted,qualified,lost"
};
