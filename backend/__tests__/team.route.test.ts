import express from "express";
import request from "supertest";
import { router as teamRouter } from "../src/routes/team.route";
import { Request, Response, NextFunction } from "express";

jest.mock("../src/controller/team.controller", () => ({
  addTeam:            jest.fn((_, res: Response) => res.status(201).json({ handler: "addTeam" })),
  updateTeam:         jest.fn((_, res: Response) => res.status(200).json({ handler: "updateTeam" })),
  deleteTeam:         jest.fn((_, res: Response) => res.status(200).json({ handler: "deleteTeam" })),
  getAllTeams:        jest.fn((_, res: Response) => res.status(200).json({ handler: "getAllTeams" })),
  getMyTeams:         jest.fn((_, res: Response) => res.status(200).json({ handler: "getMyTeams" })),
  getTeamMembers:     jest.fn((_, res: Response) => res.status(200).json({ handler: "getTeamMembers" })),
  getTeam:            jest.fn((_, res: Response) => res.status(200).json({ handler: "getTeam" })),
  addTeamMember:      jest.fn((_, res: Response) => res.status(200).json({ handler: "addTeamMember" })),
  removeTeamMember:   jest.fn((_, res: Response) => res.status(200).json({ handler: "removeTeamMember" })),
  changeTeamStatus:   jest.fn((_, res: Response) => res.status(200).json({ handler: "changeTeamStatus" })),
  exportTeamsCsv:     jest.fn((_, res: Response) => res.status(200).send("csv")),
}));

jest.mock("../src/middleware/userAuth", () => ({
  userAuth: (_req: Request, _res: Response, next: NextFunction) => next(),
}));
jest.mock("../src/middleware/roleMiddleware", () => ({
  __esModule: true,
  default: (..._roles: string[]) => (_req: Request, _res: Response, next: NextFunction) => next(),
}));

describe("Team Routes", () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/api/team", teamRouter);
  });

  it("POST   /api/team/addTeam                   → addTeam", async () => {
    const res = await request(app)
      .post("/api/team/addTeam")
      .send({ teamName: "Dev", teamSize: 5, description: "Desc", status: "Active", user_id: "u1" });
    expect(res.status).toBe(201);
    expect(res.body.handler).toBe("addTeam");
  });

  it("PUT    /api/team/:teamId                   → updateTeam", async () => {
    const res = await request(app)
      .put("/api/team/123")
      .send({ teamName: "NewName", description: "NewDesc", status: "Inactive", user_id: "u1" });
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("updateTeam");
  });

  it("DELETE /api/team/:teamId                   → deleteTeam", async () => {
    const res = await request(app)
      .delete("/api/team/123")
      .send({ user_id: "u1" });
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("deleteTeam");
  });

  it("GET    /api/team/getAllTeams               → getAllTeams", async () => {
    const res = await request(app).get("/api/team/getAllTeams");
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("getAllTeams");
  });

  it("GET    /api/team/FindMyTeams/Yes           → getMyTeams", async () => {
    const res = await request(app).get("/api/team/FindMyTeams/Yes");
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("getMyTeams");
  });

  it("GET    /api/team/:teamId/members           → getTeamMembers", async () => {
    const res = await request(app).get("/api/team/123/members");
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("getTeamMembers");
  });

  it("GET    /api/team/:teamId                   → getTeam", async () => {
    const res = await request(app).get("/api/team/123");
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("getTeam");
  });

  it("POST   /api/team/:teamId/members           → addTeamMember", async () => {
    const res = await request(app)
      .post("/api/team/123/members")
      .send({ team_userId: "u2", user_id: "u1" });
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("addTeamMember");
  });

  it("DELETE /api/team/:teamId/members/:userId   → removeTeamMember", async () => {
    const res = await request(app)
      .delete("/api/team/123/members/u2")
      .send({ user_id: "u1" });
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("removeTeamMember");
  });

  it("PATCH  /api/team/:teamId/status           → changeTeamStatus", async () => {
    const res = await request(app)
      .patch("/api/team/123/status")
      .send({ status: "Active", user_id: "u1" });
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("changeTeamStatus");
  });

  it("GET    /api/team/export/csv                → exportTeamsCsv", async () => {
    const res = await request(app).get("/api/team/export/csv");
    expect(res.status).toBe(200);
    expect(res.text).toContain("csv");
  });
});