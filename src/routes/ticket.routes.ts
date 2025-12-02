import { Router } from 'express';
import { TicketController } from '../controllers/ticket.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createTicketValidation,
  updateTicketValidation,
  ticketIdValidation,
  addCommentValidation,
  paginationValidation,
} from '../validators';

const router = Router();

// All ticket routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/tickets/stats
 * @desc    Get ticket statistics
 * @access  Private
 */
router.get(
  '/stats',
  TicketController.getStats
);

/**
 * @route   GET /api/v1/tickets
 * @desc    Get all tickets (with filters and pagination)
 * @access  Private
 */
router.get(
  '/',
  validate(paginationValidation),
  TicketController.getTickets
);

/**
 * @route   POST /api/v1/tickets
 * @desc    Create a new ticket
 * @access  Private
 */
router.post(
  '/',
  validate(createTicketValidation),
  TicketController.createTicket
);

/**
 * @route   GET /api/v1/tickets/:id
 * @desc    Get ticket by ID
 * @access  Private
 */
router.get(
  '/:id',
  validate(ticketIdValidation),
  TicketController.getTicketById
);

/**
 * @route   PUT /api/v1/tickets/:id
 * @desc    Update ticket
 * @access  Private
 */
router.put(
  '/:id',
  validate(updateTicketValidation),
  TicketController.updateTicket
);

/**
 * @route   DELETE /api/v1/tickets/:id
 * @desc    Delete ticket (Admin only)
 * @access  Private (Admin)
 */
router.delete(
  '/:id',
  authorize('ADMIN'),
  validate(ticketIdValidation),
  TicketController.deleteTicket
);

/**
 * @route   POST /api/v1/tickets/:id/comments
 * @desc    Add comment to ticket
 * @access  Private
 */
router.post(
  '/:id/comments',
  validate(addCommentValidation),
  TicketController.addComment
);

export default router;
