import express from 'express';
import { getPool } from '../config/db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /transactions - Get transactions with filters and sorting
router.get('/', async (req, res) => {
  try {
    const {
      q, // search query
      type, // income or expense
      category_id,
      start_date,
      end_date,
      sort_by = 'date', // date, amount, created_at
      sort_order = 'desc', // asc or desc
      page = 1,
      limit = 50
    } = req.query;

    const pool = getPool();
    let query = `
      SELECT
        t.id,
        t.amount,
        t.description,
        t.date,
        t.type,
        t.category_id,
        t.created_at,
        t.updated_at,
        c.name as category_name
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ?
    `;

    const queryParams = [req.user.id];
    const conditions = [];

    // Search query
    if (q) {
      conditions.push('(t.description LIKE ? OR c.name LIKE ?)');
      queryParams.push(`%${q}%`, `%${q}%`);
    }

    // Type filter
    if (type && (type === 'income' || type === 'expense')) {
      conditions.push('t.type = ?');
      queryParams.push(type);
    }

    // Category filter
    if (category_id) {
      conditions.push('t.category_id = ?');
      queryParams.push(category_id);
    }

    // Date range filters
    if (start_date) {
      conditions.push('t.date >= ?');
      queryParams.push(start_date);
    }

    if (end_date) {
      conditions.push('t.date <= ?');
      queryParams.push(end_date);
    }

    // Add conditions to query
    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }

    // Sorting
    const validSortFields = ['date', 'amount', 'created_at'];
    const validSortOrders = ['asc', 'desc'];

    if (!validSortFields.includes(sort_by)) {
      return res.status(400).json({ message: 'Invalid sort_by parameter' });
    }

    if (!validSortOrders.includes(sort_order)) {
      return res.status(400).json({ message: 'Invalid sort_order parameter' });
    }

    query += ` ORDER BY t.${sort_by} ${sort_order.toUpperCase()}`;

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ' LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), offset);

    // Execute query
    const [transactions] = await pool.execute(query, queryParams);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM transactions WHERE user_id = ?';
    const countParams = [req.user.id];
    const countConditions = [];

    if (q) {
      countConditions.push('(description LIKE ?)');
      countParams.push(`%${q}%`);
    }

    if (type && (type === 'income' || type === 'expense')) {
      countConditions.push('type = ?');
      countParams.push(type);
    }

    if (category_id) {
      countConditions.push('category_id = ?');
      countParams.push(category_id);
    }

    if (start_date) {
      countConditions.push('date >= ?');
      countParams.push(start_date);
    }

    if (end_date) {
      countConditions.push('date <= ?');
      countParams.push(end_date);
    }

    if (countConditions.length > 0) {
      countQuery += ' AND ' + countConditions.join(' AND ');
    }

    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /transactions - Create a new transaction
router.post('/', async (req, res) => {
  try {
    const { amount, description, date, type, category_id } = req.body;

    // Validation
    if (!amount || !date || !type) {
      return res.status(400).json({ message: 'Amount, date, and type are required' });
    }

    if (type !== 'income' && type !== 'expense') {
      return res.status(400).json({ message: 'Type must be income or expense' });
    }

    if (parseFloat(amount) <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    const pool = getPool();

    // If category_id is provided, verify it exists and belongs to user
    if (category_id) {
      const [category] = await pool.execute(
        'SELECT id FROM categories WHERE id = ? AND user_id = ?',
        [category_id, req.user.id]
      );

      if (category.length === 0) {
        return res.status(400).json({ message: 'Invalid category' });
      }
    }

    // Create transaction
    const [result] = await pool.execute(
      'INSERT INTO transactions (amount, description, date, type, category_id, user_id) VALUES (?, ?, ?, ?, ?, ?)',
      [parseFloat(amount), description || '', date, type, category_id || null, req.user.id]
    );

    // Get created transaction with category name
    const [newTransaction] = await pool.execute(
      `SELECT
        t.id,
        t.amount,
        t.description,
        t.date,
        t.type,
        t.category_id,
        t.created_at,
        t.updated_at,
        c.name as category_name
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.id = ?`,
      [result.insertId]
    );

    res.status(201).json(newTransaction[0]);

  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /transactions/:id - Update a transaction
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, description, date, type, category_id } = req.body;

    // Validation
    if (!amount || !date || !type) {
      return res.status(400).json({ message: 'Amount, date, and type are required' });
    }

    if (type !== 'income' && type !== 'expense') {
      return res.status(400).json({ message: 'Type must be income or expense' });
    }

    if (parseFloat(amount) <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    const pool = getPool();

    // Check if transaction exists and belongs to user
    const [existingTransaction] = await pool.execute(
      'SELECT id FROM transactions WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (existingTransaction.length === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // If category_id is provided, verify it exists and belongs to user
    if (category_id) {
      const [category] = await pool.execute(
        'SELECT id FROM categories WHERE id = ? AND user_id = ?',
        [category_id, req.user.id]
      );

      if (category.length === 0) {
        return res.status(400).json({ message: 'Invalid category' });
      }
    }

    // Update transaction
    await pool.execute(
      'UPDATE transactions SET amount = ?, description = ?, date = ?, type = ?, category_id = ? WHERE id = ? AND user_id = ?',
      [parseFloat(amount), description || '', date, type, category_id || null, id, req.user.id]
    );

    // Get updated transaction with category name
    const [updatedTransaction] = await pool.execute(
      `SELECT
        t.id,
        t.amount,
        t.description,
        t.date,
        t.type,
        t.category_id,
        t.created_at,
        t.updated_at,
        c.name as category_name
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.id = ?`,
      [id]
    );

    res.json(updatedTransaction[0]);

  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /transactions/:id - Delete a transaction
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    // Check if transaction exists and belongs to user
    const [existingTransaction] = await pool.execute(
      'SELECT id FROM transactions WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (existingTransaction.length === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Delete transaction
    await pool.execute(
      'DELETE FROM transactions WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    res.json({ message: 'Transaction deleted successfully' });

  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;