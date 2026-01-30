import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool;

export const connectDB = async () => {
  try {
    pool = mysql.createPool(dbConfig);
    const connection = await pool.getConnection();
    console.log('Connected to MySQL database');
    connection.release();
    return pool;
  } catch (error) {
    console.warn('MySQL jo i arritshëm (localhost:3306). Nisni MySQL për të përdorur të dhënat. Serveri vazhdon pa DB.');
    pool = null;
    return null;
  }
};

export const getPool = () => {
  if (!pool) {
    const err = new Error('Database not connected.');
    err.code = 'DB_NOT_CONNECTED';
    throw err;
  }
  return pool;
};

export default pool;