import UserEvent from '../models/UserEvent.js';

export class EventRepository {
  async create(eventData) {
    const event = new UserEvent(eventData);
    return await event.save();
  }

  async findByUserId(userId) {
    return await UserEvent.find({ userId }).sort({ timestamp: -1 });
  }
}