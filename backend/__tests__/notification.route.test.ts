import express from "express";
import request from "supertest";
import { router as notificationRouter } from "../src/routes/notification.route";
import { Request, Response, NextFunction } from "express";

jest.mock("../src/controller/notification.controller", () => ({
  getNotifications:      jest.fn((_, res: Response) => res.status(200).json({ handler: "getNotifications" })),
  markNotificationRead:  jest.fn((_, res: Response) => res.status(200).json({ handler: "markNotificationRead" })),
}));

jest.mock("../src/middleware/userAuth", () => ({
  userAuth: (_req: Request, _res: Response, next: NextFunction) => next(),
}));

describe("Notification Routes", () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/api/notification", notificationRouter);
  });

  it("GET  /api/notification               → getNotifications", async () => {
    const res = await request(app).get("/api/notification");
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("getNotifications");
  });

  it("PATCH /api/notification/:id/read     → markNotificationRead", async () => {
    const res = await request(app).patch("/api/notification/ntf123/read");
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("markNotificationRead");
  });
});