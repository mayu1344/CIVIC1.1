const { pool } = require('../config/database');
const logger = require('../utils/logger');
const { AppError } = require('../middleware/error.middleware');

// Create new complaint
exports.createComplaint = async (req, res, next) => {
    try {
        const {
            title,
            description,
            category,
            subCategory,
            priority,
            location,
            citizenName,
            citizenMobile,
            citizenEmail
        } = req.body;

        // Calculate SLA deadline (7 days from now as default)
        const slaDeadline = new Date();
        slaDeadline.setDate(slaDeadline.getDate() + 7);

        // Insert complaint into civic_platform schema
        const insertQuery = `
            INSERT INTO complaints (
                complaint_number, title, description, category, sub_category, priority,
                location_address, latitude, longitude, ward,
                citizen_name, citizen_mobile, citizen_email,
                sla_deadline, status
            ) VALUES (generate_complaint_number(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'submitted')
            RETURNING *
        `;

        const complaint = await pool.query(insertQuery, [
            title,
            description,
            category,
            subCategory || category,
            priority || 'medium',
            location.address,
            location.latitude || 0,
            location.longitude || 0,
            location.ward,
            citizenName,
            citizenMobile,
            citizenEmail || null,
            slaDeadline,
        ]);

        const complaintData = complaint.rows[0];
        
        // Add citizen info to response
        complaintData.citizenName = citizenName;
        complaintData.citizenMobile = citizenMobile;
        complaintData.citizen_name = citizenName;
        complaintData.citizen_mobile = citizenMobile;

        // Handle file uploads if present
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                try {
                    // Cloudinary files have 'path' property with full URL
                    // Local files need to construct the URL
                    const fileUrl = file.path || `/uploads/${file.filename}`;
                    
                    await pool.query(
                        `INSERT INTO complaint_attachments (complaint_id, file_url, file_name, file_size_kb, mime_type, file_type, uploaded_by_role, uploaded_by_name, uploaded_by_mobile)
                         VALUES ($1, $2, $3, $4, $5, $6, 'citizen', $7, $8)`,
                        [
                            complaintData.id,
                            fileUrl,
                            file.originalname,
                            Math.round(file.size / 1024), // Convert bytes to KB
                            file.mimetype,
                            file.mimetype.startsWith('image/') ? 'photo' : 
                            file.mimetype.startsWith('video/') ? 'video' : 
                            file.mimetype.startsWith('audio/') ? 'audio' : 'document',
                            citizenName,
                            citizenMobile
                        ]
                    );
                } catch (fileError) {
                    logger.warn('Could not save file metadata:', fileError.message);
                }
            }
        }

        // Log to history if table exists
        try {
            await pool.query(
                `INSERT INTO complaint_history (complaint_id, activity_type, new_status, performed_by_role, notes)
                 VALUES ($1, 'created', 'submitted', 'citizen', $2)`,
                [complaintData.id, `Complaint submitted by ${citizenName} (${citizenMobile})`]
            );
        } catch (historyError) {
            logger.warn('Could not log to history:', historyError.message);
        }

        // Emit socket event
        const io = req.app.get('io');
        if (io) {
            io.emit('complaint:new', complaintData);
        }

        logger.info(`New complaint created: ${complaintData.complaint_number}`);

        res.status(201).json({
            success: true,
            message: 'Complaint submitted successfully',
            data: complaintData,
            complaintNumber: complaintData.complaint_number
        });
    } catch (error) {
        logger.error('Error creating complaint:', error);
        next(error);
    }
};

// Get all complaints with pagination and filters
exports.getAllComplaints = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            priority,
            ward,
            department,
            officer
        } = req.query;

        const offset = (page - 1) * limit;
        let whereConditions = ['c.deleted_at IS NULL'];
        let params = [];
        let paramCount = 1;

        if (status) {
            whereConditions.push(`status = $${paramCount}`);
            params.push(status);
            paramCount++;
        }
        if (priority) {
            whereConditions.push(`priority = $${paramCount}`);
            params.push(priority);
            paramCount++;
        }
        if (ward) {
            whereConditions.push(`ward = $${paramCount}`);
            params.push(ward);
            paramCount++;
        }
        if (department) {
            whereConditions.push(`assigned_department_id = $${paramCount}`);
            params.push(department);
            paramCount++;
        }
        if (officer) {
            whereConditions.push(`assigned_officer_id = $${paramCount}`);
            params.push(officer);
            paramCount++;
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        // Get total count
        const countQuery = `SELECT COUNT(*) FROM complaints c ${whereClause}`;
        const countResult = await pool.query(countQuery, params);
        const total = parseInt(countResult.rows[0].count);

        // Get complaints
        const query = `
            SELECT c.*, 
                   d.name as department_name,
                   u.full_name as officer_name
            FROM complaints c
            LEFT JOIN departments d ON c.assigned_department_id = d.id
            LEFT JOIN officers o ON c.assigned_officer_id = o.id
            LEFT JOIN users u ON o.user_id = u.id
            ${whereClause}
            ORDER BY c.created_at DESC
            LIMIT $${paramCount} OFFSET $${paramCount + 1}
        `;

        params.push(limit, offset);
        const result = await pool.query(query, params);

        res.json({
            success: true,
            data: {
                complaints: result.rows,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        logger.error('Error fetching complaints:', error);
        next(error);
    }
};

// Get complaint by ID
exports.getComplaintById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const query = `
            SELECT c.*, 
                   d.name as department_name,
                   d.code as department_code,
                   u.full_name as officer_name,
                   u.mobile as officer_mobile,
                   o.employee_id as officer_employee_id
            FROM complaints c
            LEFT JOIN departments d ON c.assigned_department_id = d.id
            LEFT JOIN officers o ON c.assigned_officer_id = o.id
            LEFT JOIN users u ON o.user_id = u.id
            WHERE c.id = $1 AND c.deleted_at IS NULL
        `;

        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            throw new AppError('Complaint not found', 404);
        }

        // Get history
        const historyQuery = `
            SELECT ch.*, u.full_name as performed_by_name
            FROM complaint_history ch
            LEFT JOIN users u ON ch.performed_by_id = u.id
            WHERE ch.complaint_id = $1
            ORDER BY ch.created_at DESC
        `;
        const history = await pool.query(historyQuery, [id]);

        // Get comments
        const commentsQuery = `
            SELECT c.*, u.full_name as user_name
            FROM comments c
            LEFT JOIN users u ON c.user_id = u.id
            WHERE c.complaint_id = $1 AND c.deleted_at IS NULL
            ORDER BY c.created_at DESC
        `;
        const comments = await pool.query(commentsQuery, [id]);

        res.json({
            success: true,
            data: {
                complaint: result.rows[0],
                history: history.rows,
                comments: comments.rows
            }
        });
    } catch (error) {
        logger.error('Error fetching complaint:', error);
        next(error);
    }
};

// Track complaint by number
exports.trackComplaint = async (req, res, next) => {
    try {
        const { complaintNumber } = req.params;

        const query = `
            SELECT c.*, 
                   d.name as department_name,
                   u.full_name as officer_name,
                   u.email as officer_email
            FROM complaints c
            LEFT JOIN departments d ON c.assigned_department_id = d.id
            LEFT JOIN officers o ON c.assigned_officer_id = o.id
            LEFT JOIN users u ON o.user_id = u.id
            WHERE c.complaint_number = $1 AND c.deleted_at IS NULL
        `;

        const result = await pool.query(query, [complaintNumber.toUpperCase()]);

        if (result.rows.length === 0) {
            throw new AppError('Complaint not found', 404);
        }

        // Get history from complaint_history table
        const historyQuery = `
            SELECT activity_type, old_status, new_status, notes, created_at, performed_by_role
            FROM complaint_history
            WHERE complaint_id = $1
            ORDER BY created_at ASC
        `;
        
        let history = { rows: [] };
        try {
            history = await pool.query(historyQuery, [result.rows[0].id]);
        } catch (histError) {
            logger.warn('Could not fetch history:', histError.message);
        }

        res.json({
            success: true,
            data: {
                complaint: result.rows[0],
                history: history.rows
            }
        });
    } catch (error) {
        logger.error('Error tracking complaint:', error);
        next(error);
    }
};

// Update complaint status
exports.updateStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, note } = req.body;

        // Get current complaint
        const current = await pool.query('SELECT status FROM complaints WHERE id = $1', [id]);
        if (current.rows.length === 0) {
            throw new AppError('Complaint not found', 404);
        }

        const oldStatus = current.rows[0].status;

        // Update status
        const updateQuery = `
            UPDATE complaints 
            SET status = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
        `;
        const result = await pool.query(updateQuery, [status, id]);

        // Log to history
        await pool.query(
            `INSERT INTO complaint_history (complaint_id, activity_type, old_status, new_status, notes, performed_by_role)
             VALUES ($1, 'status_changed', $2, $3, $4, 'officer')`,
            [id, oldStatus, status, note || `Status changed to ${status}`]
        );

        // Emit socket event
        const io = req.app.get('io');
        io.emit('complaint:status', { id, status, oldStatus });

        logger.info(`Complaint ${id} status updated: ${oldStatus} -> ${status}`);

        res.json({
            success: true,
            message: 'Status updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        logger.error('Error updating status:', error);
        next(error);
    }
};

// Assign complaint
exports.assignComplaint = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { assignedDept, assignedOfficer } = req.body;

        const updateQuery = `
            UPDATE complaints 
            SET assigned_department_id = $1,
                assigned_officer_id = $2,
                status = 'assigned',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
            RETURNING *
        `;

        const result = await pool.query(updateQuery, [assignedDept, assignedOfficer || null, id]);

        if (result.rows.length === 0) {
            throw new AppError('Complaint not found', 404);
        }

        // Log to history
        await pool.query(
            `INSERT INTO complaint_history (complaint_id, activity_type, new_status, notes, performed_by_role)
             VALUES ($1, 'assigned', 'assigned', 'Complaint assigned to department and officer', 'admin')`,
            [id]
        );

        // Emit socket event
        const io = req.app.get('io');
        if (assignedOfficer) {
            io.to(`officer:${assignedOfficer}`).emit('complaint:assigned', result.rows[0]);
        }

        logger.info(`Complaint ${id} assigned to dept: ${assignedDept}, officer: ${assignedOfficer}`);

        res.json({
            success: true,
            message: 'Complaint assigned successfully',
            data: result.rows[0]
        });
    } catch (error) {
        logger.error('Error assigning complaint:', error);
        next(error);
    }
};

// Escalate complaint
exports.escalateComplaint = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const updateQuery = `
            UPDATE complaints 
            SET is_escalated = true,
                escalated_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `;

        const result = await pool.query(updateQuery, [id]);

        if (result.rows.length === 0) {
            throw new AppError('Complaint not found', 404);
        }

        // Log to history
        await pool.query(
            `INSERT INTO complaint_history (complaint_id, activity_type, notes, performed_by_role)
             VALUES ($1, 'escalated', $2, 'admin')`,
            [id, reason || 'Complaint escalated due to SLA breach']
        );

        // Emit socket event
        const io = req.app.get('io');
        io.to('admin').emit('complaint:escalated', result.rows[0]);

        logger.info(`Complaint ${id} escalated`);

        res.json({
            success: true,
            message: 'Complaint escalated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        logger.error('Error escalating complaint:', error);
        next(error);
    }
};

// Add comment
exports.addComment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { comment_text, visibility, is_work_note } = req.body;

        const insertQuery = `
            INSERT INTO comments (complaint_id, comment_text, visibility, is_work_note)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;

        const result = await pool.query(insertQuery, [
            id,
            comment_text,
            visibility || 'internal',
            is_work_note || false
        ]);

        // Log to history
        await pool.query(
            `INSERT INTO complaint_history (complaint_id, activity_type, notes, performed_by_role)
             VALUES ($1, 'comment_added', $2, 'officer')`,
            [id, comment_text]
        );

        res.json({
            success: true,
            message: 'Comment added successfully',
            data: result.rows[0]
        });
    } catch (error) {
        logger.error('Error adding comment:', error);
        next(error);
    }
};

// Get dashboard stats
exports.getStats = async (req, res, next) => {
    try {
        const statsQuery = `
            SELECT 
                COUNT(*) as total_complaints,
                COUNT(CASE WHEN status = 'submitted' THEN 1 END) as submitted,
                COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
                COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved,
                COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed,
                COUNT(CASE WHEN is_escalated = true THEN 1 END) as escalated,
                COUNT(CASE WHEN priority = 'critical' THEN 1 END) as critical,
                COUNT(CASE WHEN priority = 'high' THEN 1 END) as high,
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
        logger.error('Error fetching stats:', error);
        next(error);
    }
};
