const { pool } = require('../config/database');
const logger = require('../utils/logger');
const { AppError } = require('../middleware/error.middleware');

exports.getAllOfficers = async (req, res, next) => {
    try {
        const query = `
            SELECT o.*, u.full_name, u.email, u.mobile, u.status, d.name as department_name
            FROM officers o
            JOIN users u ON o.user_id = u.id
            LEFT JOIN departments d ON o.department_id = d.id
            WHERE u.status = 'active'
            ORDER BY o.performance_score DESC
        `;
        
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

exports.getOfficerById = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const query = `
            SELECT o.*, u.full_name, u.email, u.mobile, d.name as department_name
            FROM officers o
            JOIN users u ON o.user_id = u.id
            LEFT JOIN departments d ON o.department_id = d.id
            WHERE o.id = $1
        `;
        
        const result = await pool.query(query, [id]);
        
        if (result.rows.length === 0) {
            throw new AppError('Officer not found', 404);
        }
        
        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        logger.error('Error fetching officer:', error);
        next(error);
    }
};

exports.getOfficerTasks = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.query;
        
        let query = `
            SELECT * FROM complaints
            WHERE assigned_officer_id = $1 AND deleted_at IS NULL
        `;
        
        const params = [id];
        
        if (status) {
            query += ` AND status = $2`;
            params.push(status);
        }
        
        query += ` ORDER BY created_at DESC`;
        
        const result = await pool.query(query, params);
        
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        logger.error('Error fetching officer tasks:', error);
        next(error);
    }
};

exports.updateAvailability = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { is_available } = req.body;
        
        const query = `
            UPDATE officers
            SET is_available = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
        `;
        
        const result = await pool.query(query, [is_available, id]);
        
        if (result.rows.length === 0) {
            throw new AppError('Officer not found', 404);
        }
        
        res.json({
            success: true,
            message: 'Availability updated',
            data: result.rows[0]
        });
    } catch (error) {
        logger.error('Error updating availability:', error);
        next(error);
    }
};

exports.getPerformance = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const query = `
            SELECT * FROM v_officer_performance
            WHERE officer_id = $1
        `;
        
        const result = await pool.query(query, [id]);
        
        if (result.rows.length === 0) {
            throw new AppError('Officer not found', 404);
        }
        
        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        logger.error('Error fetching performance:', error);
        next(error);
    }
};
