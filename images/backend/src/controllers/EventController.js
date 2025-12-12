export class EventController {
  constructor(eventService) {
    this.eventService = eventService;
  }

  async createEvent(req, res, next) {
    try {
      const { action, data } = req.body;
      
      const event = await this.eventService.createEvent(
        req.user._id,
        req.user.email,
        action,
        data,
        req.ip,
        req.headers['user-agent']
      );

      console.log('📩 Event received (auth):', req.body, 'user:', req.user?.email);
      res.status(201).json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}