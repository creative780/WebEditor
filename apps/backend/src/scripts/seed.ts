import pool from '../config/database';
import bcrypt from 'bcrypt';

async function seed() {
  try {
    console.log('Seeding database...');

    // Create a test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const userResult = await pool.query(
      `INSERT INTO users (email, password_hash, name)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
       RETURNING id`,
      ['test@printstudio.com', hashedPassword, 'Test User']
    );

    const userId = userResult.rows[0].id;
    console.log('Created test user:', userId);

    // Create a sample design
    const designResult = await pool.query(
      `INSERT INTO designs (user_id, name, width, height, unit, dpi, bleed, color_mode)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [userId, 'Sample Design', 6, 4, 'in', 300, 0.125, 'rgb']
    );

    const designId = designResult.rows[0].id;
    console.log('Created sample design:', designId);

    // Add some sample objects
    await pool.query(
      `INSERT INTO design_objects (design_id, type, x, y, width, height, z_index, properties)
       VALUES 
       ($1, 'text', 1.5, 1.5, 3, 1, 1, $2),
       ($1, 'shape', 2.5, 2.5, 1, 1, 0, $3)`,
      [
        designId,
        JSON.stringify({
          text: 'Hello PrintStudio',
          fontFamily: 'Inter',
          fontSize: 24,
          fontWeight: 700,
          fontStyle: 'normal',
          textAlign: 'center',
          color: '#000000',
          lineHeight: 1.2,
          letterSpacing: 0,
        }),
        JSON.stringify({
          shape: 'rectangle',
          fill: { type: 'solid', color: '#3b82f6' },
          stroke: { width: 2, color: '#1e40af', style: 'solid' },
          borderRadius: 8,
        }),
      ]
    );

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();

