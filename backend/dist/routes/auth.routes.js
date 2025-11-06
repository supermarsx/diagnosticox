"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_service_1 = require("../services/auth.service");
const router = (0, express_1.Router)();
router.post('/register', async (req, res) => {
    try {
        const { email, password, full_name, organization_id, role } = req.body;
        if (!email || !password || !full_name || !organization_id) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const result = await auth_service_1.authService.register(email, password, full_name, organization_id, role);
        res.status(201).json(result);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Missing email or password' });
        }
        const result = await auth_service_1.authService.login(email, password);
        res.json(result);
    }
    catch (error) {
        res.status(401).json({ error: error.message });
    }
});
exports.default = router;
