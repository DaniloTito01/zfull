import { query } from '../config/database';
import { User, CreateUserData, UpdateUserData } from '../models/User';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export class UserService {
  async create(userData: CreateUserData): Promise<User> {
    const id = uuidv4();
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const queryText = `
      INSERT INTO users (id, email, password, name, phone, role, avatar)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      id,
      userData.email,
      hashedPassword,
      userData.name,
      userData.phone || null,
      userData.role,
      userData.avatar || null
    ];

    const result = await query(queryText, values);
    return result.rows[0];
  }

  async findById(id: string): Promise<User | null> {
    const queryText = 'SELECT * FROM users WHERE id = $1 AND active = true';
    const result = await query(queryText, [id]);
    return result.rows[0] || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const queryText = 'SELECT * FROM users WHERE email = $1 AND active = true';
    const result = await query(queryText, [email]);
    return result.rows[0] || null;
  }

  async findAll(limit: number = 50, offset: number = 0): Promise<User[]> {
    const queryText = `
      SELECT * FROM users
      WHERE active = true
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await query(queryText, [limit, offset]);
    return result.rows;
  }

  async findByRole(role: string, limit: number = 50, offset: number = 0): Promise<User[]> {
    const queryText = `
      SELECT * FROM users
      WHERE role = $1 AND active = true
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await query(queryText, [role, limit, offset]);
    return result.rows;
  }

  async update(id: string, userData: UpdateUserData): Promise<User | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (userData.email !== undefined) {
      fields.push(`email = $${paramCount++}`);
      values.push(userData.email);
    }
    if (userData.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(userData.name);
    }
    if (userData.phone !== undefined) {
      fields.push(`phone = $${paramCount++}`);
      values.push(userData.phone);
    }
    if (userData.avatar !== undefined) {
      fields.push(`avatar = $${paramCount++}`);
      values.push(userData.avatar);
    }
    if (userData.active !== undefined) {
      fields.push(`active = $${paramCount++}`);
      values.push(userData.active);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    const queryText = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    values.push(id);

    const result = await query(queryText, values);
    return result.rows[0] || null;
  }

  async updatePassword(id: string, newPassword: string): Promise<boolean> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const queryText = 'UPDATE users SET password = $1 WHERE id = $2';
    const result = await query(queryText, [hashedPassword, id]);
    return (result.rowCount || 0) > 0;
  }

  async delete(id: string): Promise<boolean> {
    const queryText = 'UPDATE users SET active = false WHERE id = $1';
    const result = await query(queryText, [id]);
    return (result.rowCount || 0) > 0;
  }

  async hardDelete(id: string): Promise<boolean> {
    const queryText = 'DELETE FROM users WHERE id = $1';
    const result = await query(queryText, [id]);
    return (result.rowCount || 0) > 0;
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return await bcrypt.compare(password, user.password);
  }

  async count(): Promise<number> {
    const queryText = 'SELECT COUNT(*) as count FROM users WHERE active = true';
    const result = await query(queryText);
    return parseInt(result.rows[0].count);
  }

  async countByRole(role: string): Promise<number> {
    const queryText = 'SELECT COUNT(*) as count FROM users WHERE role = $1 AND active = true';
    const result = await query(queryText, [role]);
    return parseInt(result.rows[0].count);
  }
}