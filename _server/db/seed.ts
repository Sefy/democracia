// import bcrypt from 'bcryptjs';
// import { query } from './index';
//
// async function seed() {
//   try {
//     // Create admin user
//     const hashedPassword = await bcrypt.hash('admin123', 10);
//     const adminResult = await query(
//       `INSERT INTO users (username, email, password, role)
//        VALUES ($1, $2, $3, $4)
//        ON CONFLICT (email) DO NOTHING
//        RETURNING id`,
//       ['admin', 'admin@example.com', hashedPassword, 'ADMIN']
//     );
//
//     const adminId = adminResult.rows[0]?.id;
//     if (adminId) {
//       // Create sample rooms
//       const rooms = [
//         {
//           title: 'Welcome to ChatRooms',
//           description: 'Get started with our community! Introduce yourself and meet other members.',
//           tags: ['welcome', 'introduction']
//         },
//         {
//           title: 'Tech Discussion',
//           description: 'Discuss the latest in technology, programming, and software development.',
//           tags: ['technology', 'programming']
//         },
//         {
//           title: 'Gaming Lounge',
//           description: 'Chat about your favorite games, share tips, and find gaming partners.',
//           tags: ['gaming', 'entertainment']
//         }
//       ];
//
//       for (const room of rooms) {
//         const roomResult = await query(
//           `INSERT INTO rooms (title, description, created_by)
//            VALUES ($1, $2, $3)
//            RETURNING id`,
//           [room.title, room.description, adminId]
//         );
//
//         const roomId = roomResult.rows[0].id;
//         for (const tag of room.tags) {
//           await query(
//             `INSERT INTO room_tags (room_id, tag)
//              VALUES ($1, $2)`,
//             [roomId, tag]
//           );
//         }
//       }
//     }
//
//     console.log('Seed data inserted successfully');
//   } catch (error) {
//     console.error('Error seeding database:', error);
//   }
// }
//
// seed();
