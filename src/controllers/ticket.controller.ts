import { Response, NextFunction } from 'express';
import { TicketService } from '../services/ticket.service';
import { ResponseHandler } from '../utils/helpers';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  CreateTicketRequest,
  UpdateTicketRequest,
  TicketFilters,
  CreateCommentRequest,
} from '../types';

export class TicketController {
  static async createTicket(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: CreateTicketRequest = req.body;
      const ticket = await TicketService.createTicket(req.user!.id, data);

      ResponseHandler.created(
        res,
        ticket,
        'Ticket created successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  static async getTickets(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters: TicketFilters = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
        status: req.query.status as string,
        priority: req.query.priority as string,
        assignedToId: req.query.assignedToId as string,
        createdById: req.query.createdById as string,
        search: req.query.search as string,
        category: req.query.category as string,
        tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      };

      const { tickets, meta } = await TicketService.getTickets(
        filters,
        req.user?.id,
        req.user?.role
      );

      ResponseHandler.success(
        res,
        tickets,
        'Tickets fetched successfully',
        200,
        meta
      );
    } catch (error) {
      next(error);
    }
  }

  static async getTicketById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const ticket = await TicketService.getTicketById(
        id,
        req.user?.id,
        req.user?.role
      );

      ResponseHandler.success(
        res,
        ticket,
        'Ticket fetched successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  static async updateTicket(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateTicketRequest = req.body;
      const ticket = await TicketService.updateTicket(
        id,
        req.user!.id,
        req.user!.role,
        data
      );

      ResponseHandler.success(
        res,
        ticket,
        'Ticket updated successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  static async deleteTicket(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await TicketService.deleteTicket(id, req.user!.id, req.user!.role);

      ResponseHandler.success(
        res,
        null,
        'Ticket deleted successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  static async addComment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { content, isInternal }: CreateCommentRequest = req.body;
      
      const comment = await TicketService.addComment(
        id,
        req.user!.id,
        req.user!.role,
        content,
        isInternal
      );

      ResponseHandler.created(
        res,
        comment,
        'Comment added successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  static async getStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await TicketService.getStats(req.user?.id, req.user?.role);

      ResponseHandler.success(
        res,
        stats,
        'Stats fetched successfully'
      );
    } catch (error) {
      next(error);
    }
  }
}
