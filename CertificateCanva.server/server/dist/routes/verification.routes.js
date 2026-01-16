"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const db_1 = require("../config/db");
const router = (0, express_1.Router)();
router.get("/authorized/:id", auth_middleware_1.authMiddleware, async (req, res) => {
    const result = await db_1.pool.query("SELECT * FROM canva_sessions WHERE id=$1 AND owner_id=$2", [req.params.id, req.user.id]);
    res.json({ authorized: result.rows.length > 0 });
});
exports.default = router;
