import { Ticket, Priority } from '@prisma/client';
import prisma from '../database/client';
import {
  NotFoundError,
  ForbiddenError,
} from '../utils/errors';
import {
  CreateTicketRequest,
  UpdateTicketRequest,
  TicketFilters,
} from '../types';
import { generateTicketNumber, paginate, getPaginationMeta } from '../utils/helpers';
import logger from '../utils/logger';

export class TicketService {
  static async createTicket(
    userId: string,
    data: CreateTicketRequest
  ): Promise<Ticket> {
    const ticketNumber = generateTicketNumber();

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber,
        title: data.title,
        description: data.description,
        priority: (data.priority as Priority) || 'MEDIUM',
        category: data.category,
        tags: data.tags || [],
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        createdById: userId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    // Create audit log
    await this.createAuditLog(
      'CREATE',
      'TICKET',
      ticket.id,
      userId,
      { ticket }
    );

    logger.info(`Ticket created: ${ticketNumber} by user ${userId}`);

    return ticket;
  }

  static async getTickets(filters: TicketFilters, userId?: string, userRole?: string) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      priority,
      assignedToId,
      createdById,
      search,
      category,
      tags,
      startDate,
      endDate,
    } = filters;

    const { skip, take } = paginate(page, limit);

    // Build where clause
    const where: any = {};

    // Regular users can only see their own tickets
    if (userRole === 'USER' && userId) {
      where.OR = [
        { createdById: userId },
        { assignedToId: userId },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (assignedToId) {
      where.assignedToId = assignedToId;
    }

    if (createdById) {
      where.createdById = createdById;
    }

    if (category) {
      where.category = category;
    }

    if (tags && tags.length > 0) {
      where.tags = {
        hasSome: tags,
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { ticketNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Get total count
    const total = await prisma.ticket.count({ where });

    // Get tickets
    const tickets = await prisma.ticket.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy]: sortOrder },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        _count: {
          select: {
            comments: true,
            attachments: true,
          },
        },
      },
    });

    const meta = getPaginationMeta(page, limit, total);

    return { tickets, meta };
  }

  static async getTicketById(ticketId: string, userId?: string, userRole?: string): Promise<any> {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        comments: {
          where: userRole === 'USER' ? { isInternal: false } : {},
          include: {
            author: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        attachments: {
          include: {
            uploadedBy: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundError('Ticket not found');
    }

    // Check access permissions
    if (userRole === 'USER' && userId) {
      if (ticket.createdById !== userId && ticket.assignedToId !== userId) {
        throw new ForbiddenError('You do not have access to this ticket');
      }
    }

    return ticket;
  }

  static async updateTicket(
    ticketId: string,
    userId: string,
    userRole: string,
    data: UpdateTicketRequest
  ): Promise<Ticket> {
    const ticket = await this.getTicketById(ticketId, userId, userRole);

    // Only agents and admins can update tickets
    if (userRole === 'USER' && ticket.createdById !== userId) {
      throw new ForbiddenError('You can only update your own tickets');
    }

    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;

    // Only agents and admins can change status and assignment
    if (userRole !== 'USER') {
      if (data.status !== undefined) {
        updateData.status = data.status;
        if (data.status === 'CLOSED' || data.status === 'RESOLVED') {
          updateData.closedAt = new Date();
        }
      }
      if (data.assignedToId !== undefined) updateData.assignedToId = data.assignedToId;
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: updateData,
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    // Create audit log
    await this.createAuditLog(
      'UPDATE',
      'TICKET',
      ticketId,
      userId,
      { old: ticket, new: updatedTicket }
    );

    logger.info(`Ticket updated: ${ticket.ticketNumber} by user ${userId}`);

    return updatedTicket;
  }

  static async deleteTicket(
    ticketId: string,
    userId: string,
    userRole: string
  ): Promise<void> {
    const ticket = await this.getTicketById(ticketId, userId, userRole);

    // Only admins can delete tickets
    if (userRole !== 'ADMIN') {
      throw new ForbiddenError('Only admins can delete tickets');
    }

    await prisma.ticket.delete({
      where: { id: ticketId },
    });

    // Create audit log
    await this.createAuditLog(
      'DELETE',
      'TICKET',
      ticketId,
      userId,
      { ticket }
    );

    logger.info(`Ticket deleted: ${ticket.ticketNumber} by user ${userId}`);
  }

  static async addComment(
    ticketId: string,
    userId: string,
    userRole: string,
    content: string,
    isInternal: boolean = false
  ) {
    // Verify ticket exists and user has access
    await this.getTicketById(ticketId, userId, userRole);

    // Only agents and admins can add internal comments
    if (isInternal && userRole === 'USER') {
      throw new ForbiddenError('Only agents and admins can add internal comments');
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        isInternal,
        ticketId,
        authorId: userId,
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    logger.info(`Comment added to ticket ${ticketId} by user ${userId}`);

    return comment;
  }

  static async getStats(userId?: string, userRole?: string) {
    const where: any = {};

    if (userRole === 'USER' && userId) {
      where.OR = [
        { createdById: userId },
        { assignedToId: userId },
      ];
    }

    const [
      total,
      open,
      inProgress,
      resolved,
      closed,
      highPriority,
      criticalPriority,
    ] = await Promise.all([
      prisma.ticket.count({ where }),
      prisma.ticket.count({ where: { ...where, status: 'OPEN' } }),
      prisma.ticket.count({ where: { ...where, status: 'IN_PROGRESS' } }),
      prisma.ticket.count({ where: { ...where, status: 'RESOLVED' } }),
      prisma.ticket.count({ where: { ...where, status: 'CLOSED' } }),
      prisma.ticket.count({ where: { ...where, priority: 'HIGH' } }),
      prisma.ticket.count({ where: { ...where, priority: 'CRITICAL' } }),
    ]);

    return {
      total,
      byStatus: {
        open,
        inProgress,
        resolved,
        closed,
      },
      byPriority: {
        high: highPriority,
        critical: criticalPriority,
      },
    };
  }

  private static async createAuditLog(
    action: string,
    entity: string,
    entityId: string,
    userId: string,
    changes: any
  ) {
    await prisma.auditLog.create({
      data: {
        action,
        entity,
        entityId,
        changes,
        userId,
      },
    });
  }
}
