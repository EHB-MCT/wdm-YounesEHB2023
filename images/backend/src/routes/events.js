import express from "express";
import { EventController } from "../controllers/EventController.js";
import { EventService } from "../services/EventService.js";
import { EventRepository } from "../repositories/EventRepository.js";
import auth from "../middleware/auth.js";
import { validateEvent } from "../middleware/validation.js";
import { errorHandler } from "../middleware/errorHandler.js";

const router = express.Router();

const eventRepository = new EventRepository();
const eventService = new EventService(eventRepository);
const eventController = new EventController(eventService);

router.post("/", auth, validateEvent, eventController.createEvent.bind(eventController));

export default router;
