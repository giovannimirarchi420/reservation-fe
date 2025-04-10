/**
 * Models and constants for webhook functionality
 */

/**
 * Webhook event types
 */
export const WebhookEventTypes = {
    EVENT_CREATED: 'EVENT_CREATED',
    EVENT_UPDATED: 'EVENT_UPDATED',
    EVENT_DELETED: 'EVENT_DELETED',
    RESOURCE_CREATED: 'RESOURCE_CREATED',
    RESOURCE_UPDATED: 'RESOURCE_UPDATED',
    RESOURCE_STATUS_CHANGED: 'RESOURCE_STATUS_CHANGED',
    RESOURCE_DELETED: 'RESOURCE_DELETED',
    ALL: 'ALL'
  };
  
  /**
   * Default webhook configuration
   */
  export const defaultWebhookConfig = {
    name: '',
    url: '',
    eventType: WebhookEventTypes.ALL,
    secret: '',
    enabled: true,
    siteId: '',
    maxRetries: 3,
    retryDelaySeconds: 60
  };
  
  /**
   * Get human-readable name for webhook event type
   * @param {string} eventType - The webhook event type
   * @returns {string} Human-readable event type name
   */
  export const getEventTypeName = (eventType) => {
    switch (eventType) {
      case WebhookEventTypes.EVENT_CREATED:
        return 'Booking Created';
      case WebhookEventTypes.EVENT_UPDATED:
        return 'Booking Updated';
      case WebhookEventTypes.EVENT_DELETED:
        return 'Booking Deleted';
      case WebhookEventTypes.RESOURCE_CREATED:
        return 'Resource Created';
      case WebhookEventTypes.RESOURCE_UPDATED:
        return 'Resource Updated';
      case WebhookEventTypes.RESOURCE_STATUS_CHANGED:
        return 'Resource status change';
      case WebhookEventTypes.RESOURCE_DELETED:
        return 'Resource Deleted';
      case WebhookEventTypes.ALL:
        return 'All Events';
      default:
        return eventType;
    }
  };