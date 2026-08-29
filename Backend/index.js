require('dotenv').config();
const express = require('express');
const cors = require('cors');
const STATUS = require('./utils/statusCodes');
const apiAuthToken = require('../Backend/middleware/auth');
const errorHandler = require('../Backend/middleware/errorHandler');
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/', apiAuthToken);

const authRoutses = require('../Backend/modules/v1/website/leads/routes/authRoutes');
const leadRoutses = require('../Backend/modules/v1/website/leads/routes/leadRoutes');

// Routes
app.use('/api/auth', authRoutses);
app.use('/api/leads', leadRoutses);

// 404 handler
app.use((req, res) => {
    res.status(STATUS.NOT_FOUND).json({ code: STATUS.NOT_FOUND, success: false, message: 'Route not found' });
});

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;  