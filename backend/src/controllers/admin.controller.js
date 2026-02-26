const { pool } = require('../config/database');
const logger = require('../utils/logger');

exports.getDashboardStats = async (req, res, next) => {
    try {
        const statsQuery = `
            SELECT 
                COUNT(*) as total_complaints,
                COUNT(CASE WHEN status IN ('submitted', 'validated', 'assigned', 'in_progress') THEN 1 END) as pending,
                COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved,
                COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed,
                COUNT(CASE WHEN is_escalated = true THEN 1 END) as escalated,
                COUNT(CASE WHEN sla_deadline < CURRENT_TIMESTAMP AND status NOT IN ('resolved', 'closed') THEN 1 END) as sla_breached,
                AVG(citizen_satisfaction_rating) as avg_satisfaction
            FROM complaints
            WHERE deleted_at IS NULL
        `;
        
        const result = await pool.query(statsQuery);
        
        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        logger.error('Error fetching dashboard stats:', error);
        next(error);
    }
};

exports.getDepartments = async (req, res, next) => {
    try {
        const query = `SELECT * FROM v_department_statistics ORDER BY department_name`;
        const result = await pool.query(query);
        
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        logger.error('Error fetching departments:', error);
        next(error);
    }
};

exports.createDepartment = async (req, res, next) => {
    try {
        const { name, code, description, contact_email, contact_phone } = req.body;
        
        const query = `
            INSERT INTO departments (name, code, description, contact_email, contact_phone)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        
        const result = await pool.query(query, [name, code, description, contact_email, contact_phone]);
        
        res.status(201).json({
            success: true,
            message: 'Department created successfully',
            data: result.rows[0]
        });
    } catch (error) {
        logger.error('Error creating department:', error);
        next(error);
    }
};

exports.getAnalytics = async (req, res, next) => {
    try {
        const { range = '30d' } = req.query;
        
        let days = 30;
        if (range === '7d') days = 7;
        if (range === '90d') days = 90;
        
        const query = `
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved
            FROM complaints
            WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
            AND deleted_at IS NULL
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `;
        
        const result = await pool.query(query);
        
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        logger.error('Error fetching analytics:', error);
        next(error);
    }
};

exports.getAllOfficers = async (req, res, next) => {
    try {
        const query = `SELECT * FROM v_officer_performance ORDER BY performance_score DESC`;
        const result = await pool.query(query);
        
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        logger.error('Error fetching officers:', error);
        next(error);
    }
};
