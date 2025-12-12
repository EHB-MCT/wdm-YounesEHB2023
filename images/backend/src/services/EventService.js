export class EventService {
  constructor(eventRepository) {
    this.eventRepository = eventRepository;
  }

  async createEvent(userId, userEmail, action, data, ip, userAgent) {
    if (!action) {
      throw new Error('Action is required');
    }

    return await this.eventRepository.create({
      userId,
      userEmail,
      action,
      data,
      ip,
      userAgent,
    });
  }
}