// filepath: backend/__tests__/notification.route.test.ts
// We recommend installing an extension to run supertest tests.

import express from "express";
import request from "supertest";
import { router as notificationRouter } from "../src/routes/notification.route";
import { getNotifications, markNotificationRead } from "../src/controller/notification.controller";
import { Request, Response, NextFunction } from "express";

jest.mock("../src/controller/notification.controller", () => ({
  getNotifications: jest.fn((_, res: Response) =>
    res.status(200).json({ handler: "getNotifications" })
  ),
  markNotificationRead: jest.fn((_, res: Response) =>
    res.status(200).json({ handler: "markNotificationRead" })
  ),
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GET  /api/notification               → getNotifications", async () => {
    const res = await request(app).get("/api/notification");
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("getNotifications");
    expect(getNotifications).toHaveBeenCalledTimes(1);
  });

  it("GET with trailing slash              → getNotifications", async () => {
    const res = await request(app).get("/api/notification/");
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("getNotifications");
  });

  it("PATCH /api/notification/:id/read     → markNotificationRead", async () => {
    const id = "ntf123";
    const res = await request(app).patch(`/api/notification/${id}/read`);
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("markNotificationRead");
    expect(markNotificationRead).toHaveBeenCalledTimes(1);
    const reqArg = (markNotificationRead as jest.Mock).mock.calls[0][0] as Request;
    expect(reqArg.params.notificationId).toBe(id);
  });

  it("returns 404 for POST /api/notification", async () => {
    const res = await request(app).post("/api/notification");
    expect(res.status).toBe(404);
  });

  it("returns 404 for unknown route", async () => {
    const res = await request(app).get("/api/notification/unknown/path");
    expect(res.status).toBe(404);
  });
});
    const res = await request(app).patch("/api/notification/ntf123/read");
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("markNotificationRead");
  });
});