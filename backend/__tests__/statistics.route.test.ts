import express from "express";
import request from "supertest";
import { router as statsRouter } from "../src/routes/statistics.route";
import { Request, Response, NextFunction } from "express";

jest.mock("../src/controller/statistics.controller", () => ({
  getTeamStatistics:             jest.fn((_, res: Response) => res.status(200).json({ handler: "getTeamStatistics" })),
  getProjectStatistics:          jest.fn((_, res: Response) => res.status(200).json({ handler: "getProjectStatistics" })),
  getDashboardStatistics:        jest.fn((_, res: Response) => res.status(200).json({ handler: "getDashboardStatistics" })),
  getDocumentTypeCounts:         jest.fn((_, res: Response) => res.status(200).json({ handler: "getDocumentTypeCounts" })),
  getDocumentInsights:           jest.fn((_, res: Response) => res.status(200).json({ handler: "getDocumentInsights" })),
  getProjectProgressDistribution:jest.fn((_, res: Response) => res.status(200).json({ handler: "getProjectProgressDistribution" })),
  getTeamCollaborationMetrics:   jest.fn((_, res: Response) => res.status(200).json({ handler: "getTeamCollaborationMetrics" })),
  getUserEngagementMetrics:      jest.fn((_, res: Response) => res.status(200).json({ handler: "getUserEngagementMetrics" })),
}));

jest.mock("../src/middleware/userAuth", () => ({
  userAuth: (_req: Request, _res: Response, next: NextFunction) => next(),
}));

describe("Statistics Routes", () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/api/statistics", statsRouter);
  });

  it("GET  /api/statistics/teams                         → getTeamStatistics", async () => {
    const res = await request(app).get("/api/statistics/teams");
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("getTeamStatistics");
  });

  it("GET  /api/statistics/projects                      → getProjectStatistics", async () => {
    const res = await request(app).get("/api/statistics/projects");
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("getProjectStatistics");
  });

  it("GET  /api/statistics/documents/type-counts         → getDocumentTypeCounts", async () => {
    const res = await request(app).get("/api/statistics/documents/type-counts");
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("getDocumentTypeCounts");
  });

  it("GET  /api/statistics/dashboard                     → getDashboardStatistics", async () => {
    const res = await request(app).get("/api/statistics/dashboard");
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("getDashboardStatistics");
  });

  it("GET  /api/statistics/documents/insights            → getDocumentInsights", async () => {
    const res = await request(app).get("/api/statistics/documents/insights");
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("getDocumentInsights");
  });

  it("GET  /api/statistics/projects/progress-distribution → getProjectProgressDistribution", async () => {
    const res = await request(app).get("/api/statistics/projects/progress-distribution");
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("getProjectProgressDistribution");
  });

  it("GET  /api/statistics/teams/collaboration-metrics   → getTeamCollaborationMetrics", async () => {
    const res = await request(app).get("/api/statistics/teams/collaboration-metrics");
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("getTeamCollaborationMetrics");
  });

  it("GET  /api/statistics/users/engagement-metrics      → getUserEngagementMetrics", async () => {
    const res = await request(app).get("/api/statistics/users/engagement-metrics");
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("getUserEngagementMetrics");
  });
});