const express = require('express')
const router = express.Router();

const leadController = require('../controller/leadController');

// --- Leads Routes ---
router.get('/', leadController.getAllLeads);           
router.post('/', leadController.createLead);           
router.get('/dashboard', leadController.getDashboardStats);
router.get('/:id', leadController.getLeadDetails);     
router.patch('/:id', leadController.updateLead);       
router.delete('/:id', leadController.deleteLead);      

// --- Notes Routes ---
router.get('/:id/notes', leadController.getNotesByLead); 
router.post('/:id/notes', leadController.addNote);       
router.patch('/notes/:note_id', leadController.updateNote);
router.delete('/notes/:note_id', leadController.deleteNote);

module.exports = router;