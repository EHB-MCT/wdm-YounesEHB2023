import UserEvent from '../models/UserEvent.js';

export class EventRepository {
  async create(eventData) {
    const event = new UserEvent(eventData);
    return await event.save();
  }

  async findByUserId(userId) {
    return await UserEvent.find({ userId }).sort({ timestamp: -1 });
  }

  async getUserEvents(userId) {
    return await UserEvent.find({ userId }).sort({ timestamp: 1 }); // chronological order
  }

  async getAllEvents() {
    return await UserEvent.find().sort({ timestamp: -1 });
  }

  async getEventStats() {
    const stats = await UserEvent.aggregate([
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      }
    ]);
    return stats;
  }

  async getEventsByDateRange(startDate, endDate) {
    try {
      return await UserEvent.find({
        timestamp: {
          $gte: startDate,
          $lte: endDate
        }
      }).sort({ timestamp: 1 });
    } catch (error) {
      console.error('Error in getEventsByDateRange:', error);
      return [];
    }
  }
}