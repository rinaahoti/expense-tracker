import express from 'express';
import { getPool } from '../config/db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /categories - Get all categories for the authenticated user
router.get('/', async (req, res) => {
  try {
    const pool = getPool();
    const [categories] = await pool.execute(
      'SELECT id, name, description, type, created_at, updated_at FROM categories WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /categories - Create a new category
router.post('/', async (req, res) => {
  try {
    const { name, description, type } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const categoryType = type || 'expense';
    if (categoryType !== 'income' && categoryType !== 'expense') {
      return res.status(400).json({ message: 'Category type must be income or expense' });
    }

    const pool = getPool();
    const [result] = await pool.execute(
      'INSERT INTO categories (name, description, type, user_id) VALUES (?, ?, ?, ?)',
      [name, description || '', categoryType, req.user.id]
    );

    const [newCategory] = await pool.execute(
      'SELECT id, name, description, type, created_at, updated_at FROM categories WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newCategory[0]);
  } catch (error) {
    console.error('Create category error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Category name already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /categories/:id - Update a category
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, type } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const categoryType = type || 'expense';
    if (categoryType !== 'income' && categoryType !== 'expense') {
      return res.status(400).json({ message: 'Category type must be income or expense' });
    }

    const pool = getPool();

    // Check if category exists and belongs to user
    const [existingCategory] = await pool.execute(
      'SELECT id FROM categories WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (existingCategory.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Update category
    await pool.execute(
      'UPDATE categories SET name = ?, description = ?, type = ? WHERE id = ? AND user_id = ?',
      [name, description || '', categoryType, id, req.user.id]
    );

    // Get updated category
    const [updatedCategory] = await pool.execute(
      'SELECT id, name, description, type, created_at, updated_at FROM categories WHERE id = ?',
      [id]
    );

    res.json(updatedCategory[0]);
  } catch (error) {
    console.error('Update category error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Category name already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /categories/:id - Delete a category
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    // Check if category exists and belongs to user
    const [existingCategory] = await pool.execute(
      'SELECT id FROM categories WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (existingCategory.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Delete category (transactions will have category_id set to NULL due to foreign key constraint)
    await pool.execute(
      'DELETE FROM categories WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;