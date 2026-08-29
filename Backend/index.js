require('dotenv').config();
const express = require('express');
const cors = require('cors');
const STATUS = require('./utils/statusCodes');
const apiAuthToken = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');
const app = express();

const db = require('./config/schema');

app.use(cors());
app.use(express.json());
app.use('/', apiAuthToken);

const authRoutses = require('./modules/v1/website/leads/routes/authRoutes');
const leadRoutses = require('./modules/v1/website/leads/routes/leadRoutes');

app.use('/api/auth', authRoutses);
app.use('/api/leads', leadRoutses);

app.use((req, res) => {
    res.status(STATUS.NOT_FOUND).json({ code: STATUS.NOT_FOUND, success: false, message: 'Route not found' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3005;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;  