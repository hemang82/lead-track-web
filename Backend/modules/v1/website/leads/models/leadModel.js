const STATUS = require("../../../../../utils/statusCodes");
const db = require('../../../../../config/db');
const { sendResponse } = require("../../../../../middleware/validatorHelper");
const moment = require('moment');

const leadModel = {

    createLead: async (req, res) => {
        try {

            const user = leadModel.getUserById(req.user_id);



            if (!user) {
                return sendResponse(res, STATUS.ERROR, "User not found", null);
            }

            const stmt = db.prepare(`INSERT INTO leads 
                (user_id, name, email, phone, source, description, status, created_at, updated_at) 
                VALUES 
                (@user_id, @name, @email, @phone, @source, @description, @status, @created_at, @updated_at)`);



                
            const insertParam = {
                user_id: req.user_id,
                name: req.name,
                email: req.email,
                phone: req.phone || null,
                source: req.source || null,
                status: req.status || 'new',
                description: req.description || null,
                created_at: moment().utc().format("YYYY-MM-DD HH:mm:ss"),
                updated_at: moment().utc().format("YYYY-MM-DD HH:mm:ss")
            };

            const response = stmt.run(insertParam);

            if (!response.lastInsertRowid) {
                return sendResponse(res, STATUS.ERROR, "Lead creation failed", null);
            }

            const leadDetails = await leadModel.getLeadById(response.lastInsertRowid);

            if (!leadDetails) {
                return sendResponse(res, STATUS.ERROR, "Lead details not found", null);
            }

            return sendResponse(res, STATUS.CREATED, "Lead created successfully", leadDetails);

        } catch (error) {
            console.error("Login error:", error);
            return sendResponse(res, STATUS.ERROR, "Something went wrong during login", null);
        }
    },

    updateLead: async (req, res) => {
        try {
            const leadId = req.lead_id;
            const request = req;

            const checkLeadDetails = await leadModel.getLeadById(leadId);

            if (!checkLeadDetails) {
                return sendResponse(res, STATUS.ERROR, "Lead details not found", null);
            }

            let updateFields = [];
            let updateValues = {};

            if (request.name !== undefined) {
                updateFields.push('name = @name');
                updateValues.name = request.name;
            }
            if (request.email !== undefined) {
                updateFields.push('email = @email');
                updateValues.email = request.email;
            }
            if (request.phone !== undefined) {
                updateFields.push('phone = @phone');
                updateValues.phone = request.phone;
            }
            if (request.source !== undefined) {
                updateFields.push('source = @source');
                updateValues.source = request.source;
            }
            if (request.description !== undefined) {
                updateFields.push('description = @description');
                updateValues.description = request.description;
            }
            if (request.status !== undefined) {
                updateFields.push('status = @status');
                updateValues.status = request.status;
            }

            if (updateFields.length === 0) {
                return sendResponse(res, STATUS.ERROR, "No data provided to update", null);
            }

            updateFields.push('updated_at = @updated_at');
            updateValues.updated_at = moment().utc().format("YYYY-MM-DD HH:mm:ss");
            updateValues.id = leadId;

            const query = `UPDATE leads SET ${updateFields.join(', ')} WHERE id = @id AND is_delete = 0`;

            const stmt = db.prepare(query);
            const response = stmt.run(updateValues);

            if (response.changes === 0) {
                return sendResponse(res, STATUS.ERROR, "Lead details not found", null);
            }

            const leadDetails = await leadModel.getLeadById(leadId);
            if (!leadDetails) {
                return sendResponse(res, STATUS.ERROR, "Lead details not found", null);
            }

            return sendResponse(res, STATUS.OK, "Lead updated successfully", leadDetails);

        } catch (error) {
            console.error("Update Lead Error:", error);
            return sendResponse(res, STATUS.ERROR, "Something went wrong while updating lead", null);
        }
    },

    deleteLead: async (req, res) => {
        try {
            const leadId = req.lead_id;

            const checkLeadDetails = await leadModel.getLeadById(leadId);

            if (!checkLeadDetails) {
                return sendResponse(res, STATUS.ERROR, "Lead details not found", null);
            }

            const stmt = db.prepare(`UPDATE leads SET is_delete = 1, updated_at = @updated_at WHERE id = @id AND is_delete = 0`);

            const deleteParam = {
                id: leadId,
                updated_at: moment().utc().format("YYYY-MM-DD HH:mm:ss")
            };

            const response = stmt.run(deleteParam);

            if (response.changes === 0) {
                return sendResponse(res, STATUS.ERROR, "Lead not found or already deleted", null);
            }

            return sendResponse(res, STATUS.OK, "Lead deleted successfully", null);

        } catch (error) {
            console.error("Delete Lead Error:", error);
            return sendResponse(res, STATUS.ERROR, "Something went wrong while deleting lead", null);
        }
    },

    getLeadDetails: async (req, res) => {
        try {
            // req.body 
            const leadId = req.lead_id;

            const leadDetails = leadModel.getLeadById(leadId);

            if (!leadDetails) {
                return sendResponse(res, STATUS.NOT_FOUND, "Lead details not found", null);
            }

            return sendResponse(res, STATUS.OK, "Lead details fetched successfully", leadDetails);

        } catch (error) {
            console.error("Get Lead Details Error:", error);
            return sendResponse(res, STATUS.ERROR, "Something went wrong while fetching lead details", null);
        }
    },

    getAllLeads: async (req, res) => {
        try {
            const page = parseInt(req.page) || 1;
            const per_page = parseInt(req.per_page) || 10;
            const offset = (page - 1) * per_page;

            let conditions = "WHERE is_delete = 0";
            let filterParams = {};

            // User ID Filter
            if (req.user_id) {
                conditions += " AND user_id = @user_id";
                filterParams.user_id = req.user_id;
            }

            // Status Filter
            if (req.status && req.status !== "") {
                conditions += " AND status = @status";
                filterParams.status = req.status;
            }

            // Search Filter (name, email, phone)
            if (req.search && req.search !== "") {
                conditions += " AND (name LIKE @search OR email LIKE @search OR phone LIKE @search)";
                filterParams.search = `%${req.search}%`;
            }

            // Total count 
            const countQuery = `SELECT COUNT(id) as total FROM leads ${conditions}`;
            const countResult = db.prepare(countQuery).get(filterParams);
            const totalRecords = countResult.total;

            // Data Query
            const dataQuery = `
                SELECT id, user_id, name, email, phone, source, description, status, created_at 
                FROM leads 
                ${conditions} 
                ORDER BY id DESC 
                LIMIT @per_page OFFSET @offset`;

            const dataParams = {
                ...filterParams,
                per_page: per_page,
                offset: offset
            };

            const leadsData = db.prepare(dataQuery).all(dataParams);

            const notesStmt = db.prepare(`SELECT id, user_id, content, created_at FROM notes WHERE lead_id = @id AND is_delete = 0 ORDER BY id DESC`);
            leadsData.forEach(lead => {
                lead.notes = notesStmt.all({ id: lead.id });
            });

            if (!leadsData || leadsData.length === 0) {
                return sendResponse(res, STATUS.NOT_FOUND, "No leads found", {
                    leads: [],
                    pagination: {
                        total_records: totalRecords,
                        total_pages: Math.ceil(totalRecords / per_page),
                        current_page: page,
                        per_page: per_page
                    }
                });
            }

            const responseData = {
                leads: leadsData,
                pagination: {
                    total_records: totalRecords,
                    total_pages: Math.ceil(totalRecords / per_page),
                    current_page: page,
                    per_page: per_page
                }
            };

            return sendResponse(res, STATUS.OK, "Leads list fetched successfully", responseData);

        } catch (error) {
            console.error("List Leads Error:", error);
            return sendResponse(res, STATUS.ERROR, "Something went wrong", null);
        }
    },

    getLeadDetails: async (req, res) => {
        try {

            const leadId = req.lead_id;

            const leadDetails = leadModel.getLeadById(leadId);

            if (!leadDetails) {
                return sendResponse(res, STATUS.NOT_FOUND, "Lead details not found", null);
            }

            return sendResponse(res, STATUS.OK, "Lead details fetched successfully", leadDetails);

        } catch (error) {
            console.error("Get Lead Details Error:", error);
            return sendResponse(res, STATUS.ERROR, "Something went wrong while fetching lead details", null);
        }
    },

    // ======================================== Lead Notes ==============================================================

    addNote: async (req, res) => {
        try {

            const checkLead = leadModel.getLeadById(req.lead_id);

            if (!checkLead) {
                return sendResponse(res, STATUS.NOT_FOUND, "Lead not found", null);
            }

            const stmt = db.prepare(`INSERT INTO notes (lead_id, user_id, content, created_at) VALUES (@lead_id, @user_id, @content, @created_at)`);

            const noteParams = {
                lead_id: req.lead_id,
                user_id: req.user_id,
                content: req.content,
                created_at: moment().utc().format("YYYY-MM-DD HH:mm:ss")
            };

            const response = stmt.run(noteParams);

            if (!response.lastInsertRowid) {
                return sendResponse(res, STATUS.ERROR, "Failed to add note", null);
            }

            const noteDetails = leadModel.getNoteById(response.lastInsertRowid);
            if (!noteDetails) {
                return sendResponse(res, STATUS.ERROR, "Note details not found", null);
            }

            return sendResponse(res, STATUS.CREATED, "Note added successfully", noteDetails);

        } catch (error) {
            console.error("Add Note Error:", error);
            return sendResponse(res, STATUS.ERROR, "Something went wrong while adding note", null);
        }
    },

    updateNote: async (req, res) => {
        try {
            const noteId = req.note_id;

            const checkNote = leadModel.getNoteById(noteId);
            if (!checkNote) {
                return sendResponse(res, STATUS.NOT_FOUND, "Note not found", null);
            }

            const stmt = db.prepare(`
                UPDATE notes 
                SET content = @content 
                WHERE id = @id AND is_delete = 0
            `);

            const updateParams = {
                id: noteId,
                content: req.content
            };

            const response = stmt.run(updateParams);

            if (response.changes === 0) {
                return sendResponse(res, STATUS.ERROR, "Failed to update note", null);
            }

            const updatedNote = leadModel.getNoteById(noteId);

            return sendResponse(res, STATUS.OK, "Note updated successfully", updatedNote);

        } catch (error) {
            console.error("Update Note Error:", error);
            return sendResponse(res, STATUS.ERROR, "Something went wrong while updating note", null);
        }
    },

    deleteNote: async (req, res) => {
        try {
            const noteId = req.note_id;

            const checkNote = leadModel.getNoteById(noteId);
            if (!checkNote) {
                return sendResponse(res, STATUS.NOT_FOUND, "Lead note not found", null);
            }

            const stmt = db.prepare(`UPDATE notes SET is_delete = 1 WHERE id = @id AND is_delete = 0`);

            const deleteParams = {
                id: noteId
            };

            const response = stmt.run(deleteParams);

            if (response.changes === 0) {
                return sendResponse(res, STATUS.ERROR, "Failed to delete note", null);
            }

            return sendResponse(res, STATUS.OK, "Note deleted successfully", null);

        } catch (error) {
            console.error("Delete Note Error:", error);
            return sendResponse(res, STATUS.ERROR, "Something went wrong while deleting note", null);
        }
    },

    // ======================================== Lead Notes ==============================================================

    getNotesByLead: async (req, res) => {
        try {
            const leadId = req.lead_id;

            const checkLead = leadModel.getLeadById(leadId);
            if (!checkLead) {
                return sendResponse(res, STATUS.NOT_FOUND, "Lead not found", null);
            }

            const stmt = db.prepare(`
                SELECT id, lead_id, user_id, content, created_at 
                FROM notes 
                WHERE lead_id = @lead_id AND is_delete = 0 
                ORDER BY id DESC
            `);

            const notesList = stmt.all({ lead_id: leadId });

            if (!notesList || notesList.length === 0) {
                return sendResponse(res, STATUS.NOT_FOUND, "No notes found for this lead", []);
            }

            return sendResponse(res, STATUS.OK, "Notes fetched successfully", notesList);

        } catch (error) {
            console.error("Get Notes By Lead Error:", error);
            return sendResponse(res, STATUS.ERROR, "Something went wrong while fetching notes", null);
        }
    },

    getNoteById: (noteId) => {
        try {

            const stmt = db.prepare(`SELECT id, lead_id, user_id, content, created_at FROM notes WHERE id = @id AND is_delete = 0`);

            const note = stmt.get({ id: noteId });
            if (note) {
                return note;
            } else {
                return null;
            }
        } catch (error) {
            console.error("Get Note By Id Error:", error.message);
            return false;
        }
    },

    getDashboardStats: async (req, res) => {
        try {
            let conditions = "WHERE is_delete = 0";
            let queryParams = {};

            if (req.user_id) {
                conditions += " AND user_id = @user_id";
                queryParams.user_id = req.user_id;
            }

            const statsQuery = `
                SELECT 
                    COUNT(id) as total_leads,
                    SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_leads,
                    SUM(CASE WHEN status = 'contacted' THEN 1 ELSE 0 END) as contacted_leads,
                    SUM(CASE WHEN status = 'qualified' THEN 1 ELSE 0 END) as qualified_leads,
                    SUM(CASE WHEN status = 'lost' THEN 1 ELSE 0 END) as lost_leads
                FROM leads 
                ${conditions}
            `;

            const stats = db.prepare(statsQuery).get(queryParams);

            // Handle null values (if table is empty, SUM returns null)
            const dashboardData = {
                total_leads: stats.total_leads || 0,
                new_leads: stats.new_leads || 0,
                contacted_leads: stats.contacted_leads || 0,
                qualified_leads: stats.qualified_leads || 0,
                lost_leads: stats.lost_leads || 0
            };

            return sendResponse(res, STATUS.OK, "Dashboard stats fetched successfully", dashboardData);

        } catch (error) {
            console.error("Dashboard Stats Error:", error);
            return sendResponse(res, STATUS.ERROR, "Something went wrong while fetching dashboard stats", null);
        }
    },

    getLeadById: (leadId) => {
        try {
            const stmt = db.prepare(`
                SELECT id, user_id, name, email, phone, source, description, status, created_at, updated_at 
                FROM leads 
                WHERE id = @id AND is_delete = 0
            `);

            const lead = stmt.get({ id: leadId });

            if (lead) {
                const notesStmt = db.prepare(`SELECT id, user_id, content, created_at FROM notes WHERE lead_id = @id AND is_delete = 0 ORDER BY id DESC`);
                lead.notes = notesStmt.all({ id: lead.id });

                return lead;
            } else {
                return null;
            }

        } catch (error) {
            console.error("Get Lead By Id Error:", error.message);
            return false;
        }
    },

    getUserById: (userId) => {
        try {
            console.log("Fetching user by ID:", userId);
            const stmt = db.prepare('SELECT id, name, email, is_active, is_delete FROM users WHERE id = @id AND is_delete = 0');

            const user = stmt.get({ id: userId });

            if (user) {
                console.log("User details retrieved:", user);
                return user;
            } else {
                console.log("User not found");
                return null;
            }
        } catch (error) {
            console.error("User get karvama error:", error.message);
            return false;
        }
    }

}

module.exports = leadModel;
