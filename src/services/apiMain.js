/**
 * Main API module that aggregates all API services
 */
import apiRequest from './apiCore';
import * as userService from './userService';
import * as resourceService from './resourceService';
import * as resourceTypeService from './resourceTypeService';
import * as bookingService from './bookingService';
import * as notificationService from './notificationService';
import * as federationService from './federationService';
import * as webhookService from './webhookService';

// Export all services as a default object
export default {
  request: apiRequest,
  users: userService,
  resources: resourceService,
  resourceTypes: resourceTypeService,
  events: bookingService,
  notifications: notificationService,
  federations: federationService,
  webhooks: webhookService
};

// Also export individual services for direct imports
export {
  userService,
  resourceService,
  resourceTypeService,
  bookingService,
  notificationService,
  federationService,
  webhookService
};