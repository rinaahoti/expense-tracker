import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
};

async function setupDatabase() {
  let connection;

  try {
    // Connect without specifying database to create it
    console.log('Connecting to MySQL...');
    connection = await mysql.createConnection(dbConfig);

    // Create database if it doesn't exist
    console.log('Creating database...');
    await connection.query('CREATE DATABASE IF NOT EXISTS expense_tracker');
    console.log('Database created successfully');

    // Use the database
    await connection.query('USE expense_tracker');

    // Read and execute the schema file
    console.log('Setting up tables...');
    const schemaPath = path.join(__dirname, 'database.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    // Split by semicolons and execute each statement
    const statements = schemaSQL.split(';').filter(stmt => stmt.trim().length > 0);

    for (const statement of statements) {
      if (statement.trim()) {
        await connection.query(statement);
      }
    }

    console.log('Database setup completed successfully!');
    console.log('Tables created: users, categories, transactions');

  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();