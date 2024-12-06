// import bcrypt from 'bcryptjs';
// import { query } from './index';

import { Container } from "../services/container";
import { TagData } from "@common/room";

async function seed() {

  const container = new Container();

  try {

    const tags: (Omit<TagData, 'id'>)[] = [
      {name: 'Finances Publiques', icon: 'account_balance', color: '#D59B21'},
      {name: 'Economie', icon: 'savings', color: '#e8cb7d'},
      {name: 'Ecologie', icon: 'eco', color: '#3adda3'},
      {name: 'Sécurité', icon: 'security', color: '#1861ab'},
      {name: 'Défense', icon: 'military_tech', color: '#587e6b'},
      {name: 'Politique étrangère', icon: 'public', color: '#64b7ef'},
      {name: 'Culture', icon: 'image', color: '#af4a8d'},
      {name: 'Santé', icon: 'health_and_safety', color: '#8cdf34'},
      {name: 'Education', icon: 'school', color: '#4359a1'},
    ];

    await Promise.all(tags.map(tag => container.em.tag.create(tag)));

    console.log('Seed data inserted successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }

  // try {
  //   // Create admin user
  //   // const hashedPassword = await bcrypt.hash('admin123', 10);
  //   // const adminResult = await query(
  //   //   `INSERT INTO users (username, email, password, role)
  //   //    VALUES ($1, $2, $3, $4)
  //   //    ON CONFLICT (email) DO NOTHING
  //   //    RETURNING id`,
  //   //   ['admin', 'admin@example.com', hashedPassword, 'ADMIN']
  //   // );
  //
  //   // const adminId = adminResult.rows[0]?.id;
  //   if (adminId) {
  //     // Create sample rooms
  //     const rooms = [
  //       {
  //         title: 'Welcome to ChatRooms',
  //         description: 'Get started with our community! Introduce yourself and meet other members.',
  //         tags: ['welcome', 'introduction']
  //       },
  //       {
  //         title: 'Tech Discussion',
  //         description: 'Discuss the latest in technology, programming, and software development.',
  //         tags: ['technology', 'programming']
  //       },
  //       {
  //         title: 'Gaming Lounge',
  //         description: 'Chat about your favorite games, share tips, and find gaming partners.',
  //         tags: ['gaming', 'entertainment']
  //       }
  //     ];
  //
  //     for (const room of rooms) {
  //       const roomResult = await query(
  //         `INSERT INTO rooms (title, description, created_by)
  //          VALUES ($1, $2, $3)
  //          RETURNING id`,
  //         [room.title, room.description, adminId]
  //       );
  //
  //       const roomId = roomResult.rows[0].id;
  //       for (const tag of room.tags) {
  //         await query(
  //           `INSERT INTO room_tags (room_id, tag)
  //            VALUES ($1, $2)`,
  //           [roomId, tag]
  //         );
  //       }
  //     }
  //   }
}

seed();
