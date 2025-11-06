"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const config_1 = require("./config");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const patient_routes_1 = __importDefault(require("./routes/patient.routes"));
const problem_routes_1 = __importDefault(require("./routes/problem.routes"));
const bayesian_routes_1 = __importDefault(require("./routes/bayesian.routes"));
const trial_routes_1 = __importDefault(require("./routes/trial.routes"));
const timeline_routes_1 = __importDefault(require("./routes/timeline.routes"));
const diary_routes_1 = __importDefault(require("./routes/diary.routes"));
const security_routes_1 = __importDefault(require("./routes/security.routes"));
const app = (0, express_1.default)();
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: config_1.config.cors.allowedOrigins,
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// API Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/patients', patient_routes_1.default);
app.use('/api/problems', problem_routes_1.default);
app.use('/api/bayesian', bayesian_routes_1.default);
app.use('/api/trials', trial_routes_1.default);
app.use('/api/timeline', timeline_routes_1.default);
app.use('/api/diary', diary_routes_1.default);
app.use('/api/security', security_routes_1.default);
// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
    });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
const PORT = config_1.config.port;
app.listen(PORT, () => {
    console.log(`Medical Diagnosis API server running on port ${PORT}`);
    console.log(`Database type: ${config_1.config.database.type}`);
    console.log(`Environment: ${config_1.config.nodeEnv}`);
});
exports.default = app;
