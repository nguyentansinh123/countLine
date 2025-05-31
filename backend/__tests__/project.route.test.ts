import express from "express";
import request from "supertest";
import { router as projectRouter } from "../src/routes/project.route";
import { Request, Response, NextFunction } from "express";

jest.mock("../src/controller/project.controller", () => ({
  createProject:    jest.fn((_, res: Response) => res.status(200).json({ handler: "createProject" })),
  getProject:       jest.fn((_, res: Response) => res.status(200).json({ handler: "getProject" })),
  updateProject:    jest.fn((_, res: Response) => res.status(200).json({ handler: "updateProject" })),
  deleteProject:    jest.fn((_, res: Response) => res.status(200).json({ handler: "deleteProject" })),
  getAllProject:    jest.fn((_, res: Response) => res.status(200).json({ handler: "getAllProject" })),
  addTeamToProject: jest.fn((_, res: Response) => res.status(200).json({ handler: "addTeamToProject" })),
}));

jest.mock("../src/middleware/userAuth", () => ({
  userAuth: (_req: Request, _res: Response, next: NextFunction) => next(),
}));
jest.mock("../src/middleware/roleMiddleware", () => ({
  __esModule: true,
  default: (..._roles: string[]) => (_req: Request, _res: Response, next: NextFunction) => next(),
}));

describe("Project Routes", () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/api/project", projectRouter);
  });

  it("POST   /api/project/               → createProject", async () => {
    const res = await request(app)
      .post("/api/project/")
      .send({ projectName: "Test", projectStart: "01/01/2025", user_id: "u1" });
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("createProject");
  });

  it("PUT    /api/project/:projectId     → updateProject", async () => {
    const res = await request(app)
      .put("/api/project/123")
      .send({ user_id: "u1", projectName: "Updated" });
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("updateProject");
  });

  it("DELETE /api/project/:projectId     → deleteProject", async () => {
    const res = await request(app)
      .delete("/api/project/123")
      .send({ user_id: "u1" });
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("deleteProject");
  });

  it("POST   /api/project/addTeamToProject → addTeamToProject", async () => {
    const res = await request(app)
      .post("/api/project/addTeamToProject")
      .send({ projectId: "p1", teamId: "t1", user_id: "u1" });
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("addTeamToProject");
  });

  it("GET    /api/project/GetallProject  → getAllProject", async () => {
    const res = await request(app).get("/api/project/GetallProject");
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("getAllProject");
  });

  it("GET    /api/project/:projectId     → getProject", async () => {
    const res = await request(app).get("/api/project/987");
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("getProject");
  });
});