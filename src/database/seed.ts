import bcrypt from 'bcryptjs';
import prisma from './client';
import logger from '../utils/logger';

const seedUsers = async () => {
  const users = [
    {
      email: 'admin@cloudcare.com',
      password: await bcrypt.hash('Admin@123', 10),
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN' as const,
    },
    {
      email: 'agent@cloudcare.com',
      password: await bcrypt.hash('Agent@123', 10),
      firstName: 'Support',
      lastName: 'Agent',
      role: 'AGENT' as const,
    },
    {
      email: 'user@cloudcare.com',
      password: await bcrypt.hash('User@123', 10),
      firstName: 'Regular',
      lastName: 'User',
      role: 'USER' as const,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }

  logger.info('✓ Users seeded');
};

const seedTickets = async () => {
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@cloudcare.com' },
  });
  const agent = await prisma.user.findUnique({
    where: { email: 'agent@cloudcare.com' },
  });
  const user = await prisma.user.findUnique({
    where: { email: 'user@cloudcare.com' },
  });

  if (!admin || !agent || !user) return;

  const tickets = [
    {
      ticketNumber: 'TCK-001',
      title: 'Unable to login to dashboard',
      description: 'I am getting an error when trying to login to my account. The error message says "Invalid credentials" even though I am using the correct password.',
      priority: 'HIGH' as const,
      status: 'OPEN' as const,
      category: 'Authentication',
      tags: ['login', 'auth'],
      createdById: user.id,
      assignedToId: agent.id,
    },
    {
      ticketNumber: 'TCK-002',
      title: 'Feature request: Dark mode',
      description: 'It would be great to have a dark mode option for the application. Many users prefer dark themes, especially when working late at night.',
      priority: 'LOW' as const,
      status: 'IN_PROGRESS' as const,
      category: 'Feature Request',
      tags: ['ui', 'enhancement'],
      createdById: user.id,
      assignedToId: agent.id,
    },
    {
      ticketNumber: 'TCK-003',
      title: 'Critical: Data not syncing',
      description: 'Customer data is not syncing properly between the mobile app and web dashboard. This is causing major issues for our team.',
      priority: 'CRITICAL' as const,
      status: 'OPEN' as const,
      category: 'Bug',
      tags: ['sync', 'critical', 'data'],
      createdById: admin.id,
      assignedToId: agent.id,
    },
    {
      ticketNumber: 'TCK-004',
      title: 'Need help with API integration',
      description: 'I am trying to integrate your API with our system but facing CORS issues. Can someone guide me on the proper configuration?',
      priority: 'MEDIUM' as const,
      status: 'WAITING_ON_CUSTOMER' as const,
      category: 'Support',
      tags: ['api', 'integration'],
      createdById: user.id,
    },
  ];

  for (const ticket of tickets) {
    const existing = await prisma.ticket.findUnique({
      where: { ticketNumber: ticket.ticketNumber },
    });

    if (!existing) {
      await prisma.ticket.create({ data: ticket });
    }
  }

  logger.info('✓ Tickets seeded');
};

const seedComments = async () => {
  const ticket = await prisma.ticket.findFirst({
    where: { ticketNumber: 'TCK-001' },
  });
  const agent = await prisma.user.findUnique({
    where: { email: 'agent@cloudcare.com' },
  });

  if (!ticket || !agent) return;

  const existingComments = await prisma.comment.findMany({
    where: { ticketId: ticket.id },
  });

  if (existingComments.length === 0) {
    await prisma.comment.create({
      data: {
        content: 'Thank you for reporting this issue. We are looking into it and will get back to you shortly.',
        ticketId: ticket.id,
        authorId: agent.id,
        isInternal: false,
      },
    });

    await prisma.comment.create({
      data: {
        content: 'Internal note: Check the authentication service logs for this user.',
        ticketId: ticket.id,
        authorId: agent.id,
        isInternal: true,
      },
    });
  }

  logger.info('✓ Comments seeded');
};

const main = async () => {
  try {
    logger.info('🌱 Starting database seed...');

    await seedUsers();
    await seedTickets();
    await seedComments();

    logger.info('✅ Database seeded successfully!');
    logger.info('\nTest Credentials:');
    logger.info('Admin: admin@cloudcare.com / Admin@123');
    logger.info('Agent: agent@cloudcare.com / Agent@123');
    logger.info('User: user@cloudcare.com / User@123');
  } catch (error) {
    logger.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

main();
