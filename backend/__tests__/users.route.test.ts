import express from "express";
import request from "supertest";
import { router as usersRouter } from "../src/routes/users.route";

// types for our mocked middlewares
import { Request, Response, NextFunction } from "express";

jest.mock("../src/controller/users.controller", () => ({
  getAllUser: jest.fn((_, res: Response) =>
    res.status(200).json({ handler: "getAllUser" })
  ),
  getLoggedInUser: jest.fn((_, res: Response) =>
    res.status(200).json({ handler: "getLoggedInUser" })
  ),
  getSingleUser: jest.fn((_, res: Response) =>
    res.status(200).json({ handler: "getSingleUser" })
  ),
  getUserById: jest.fn((_, res: Response) =>
    res.status(200).json({ handler: "getUserById" })
  ),
  getUserDocumentsById: jest.fn((_, res: Response) =>
    res.status(200).json({ handler: "getUserDocumentsById" })
  ),
  getAllUserDocuments: jest.fn((_, res: Response) =>
    res.status(200).json({ handler: "getAllUserDocuments" })
  ),
  getSingleUserDocument: jest.fn((_, res: Response) =>
    res.status(200).json({ handler: "getSingleUserDocument" })
  ),
  getUserByName: jest.fn((_, res: Response) =>
    res.status(200).json({ handler: "getUserByName" })
  ),
  searchUsersByName: jest.fn((_, res: Response) =>
    res.status(200).json({ handler: "searchUsersByName" })
  ),
  addRecentSearch: jest.fn((_, res: Response) =>
    res.status(200).json({ handler: "addRecentSearch" })
  ),
  getRecentSearches: jest.fn((_, res: Response) =>
    res.status(200).json({ handler: "getRecentSearches" })
  ),
  updateUser: jest.fn((_, res: Response) =>
    res.status(200).json({ handler: "updateUser" })
  ),
  updateUserProfile: jest.fn((_, res: Response) =>
    res.status(200).json({ handler: "updateUserProfile" })
  ),
  updateUserName: jest.fn((_, res: Response) =>
    res.status(200).json({ handler: "updateUserName" })
  ),
  updateProfilePic: jest.fn((_, res: Response) =>
    res.status(200).json({ handler: "updateProfilePic" })
  ),
  deleteUser: jest.fn((_, res: Response) =>
    res.status(200).json({ handler: "deleteUser" })
  ),
  reassignUserRole: jest.fn((_, res: Response) =>
    res.status(200).json({ handler: "reassignUserRole" })
  ),
}));

jest.mock("../src/middleware/userAuth", () => ({
  userAuth: (_req: Request, _res: Response, next: NextFunction) => next(),
}));
jest.mock("../src/middleware/requireAuth", () => ({
  requireAuth: (_req: Request, _res: Response, next: NextFunction) => next(),
}));
jest.mock("../src/middleware/roleMiddleware", () => ({
  __esModule: true,
  default:
    (...roles: string[]) =>
    (_req: Request, _res: Response, next: NextFunction) =>
      next(),
}));
jest.mock("../src/lib/multerconfig", () => ({
  upload: {
    single:
      (_field: string) => (_req: Request, _res: Response, next: NextFunction) =>
        next(),
  },
}));

describe("Users Routes", () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/api/users", usersRouter);
  });

  it("GET  /api/users/me                  → getLoggedInUser", async () => {
    const res = await request(app).get("/api/users/me");
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("getLoggedInUser");
  });

  it("PUT  /api/users/update-profile      → updateProfilePic", async () => {
    const res = await request(app)
      .put("/api/users/update-profile")
      .attach("profilePicture", Buffer.from(""), "test.png");
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("updateProfilePic");
  });

  it("PUT  /api/users/update-name         → updateUserName", async () => {
    const res = await request(app)
      .put("/api/users/update-name")
      .send({ name: "Alice" });
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("updateUserName");
  });

  it("GET  /api/users/SingleUserDocument/:id → getSingleUserDocument", async () => {
    const res = await request(app).get("/api/users/SingleUserDocument/123");
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("getSingleUserDocument");
  });

  it("POST /api/users/getUserByName       → getUserByName", async () => {
    const res = await request(app)
      .post("/api/users/getUserByName")
      .send({ name: "Bob" });
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("getUserByName");
  });

  it("GET  /api/users/search?term=x       → searchUsersByName", async () => {
    const res = await request(app).get("/api/users/search?term=x");
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("searchUsersByName");
  });

  it("POST /api/users/recent-searches    → addRecentSearch", async () => {
    const res = await request(app)
      .post("/api/users/recent-searches")
      .send({ user_id: "u1", searchedUserId: "u2", searchedUserName: "Carol" });
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("addRecentSearch");
  });

  it("GET  /api/users/recent-searches    → getRecentSearches", async () => {
    const res = await request(app)
      .get("/api/users/recent-searches")
      .send({ user_id: "u1" });
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("getRecentSearches");
  });

  it("GET  /api/users/getAllUser         → getAllUser", async () => {
    const res = await request(app).get("/api/users/getAllUser");
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("getAllUser");
  });

  it("GET  /api/users/AllUserDocuments   → getAllUserDocuments", async () => {
    const res = await request(app).get("/api/users/AllUserDocuments");
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("getAllUserDocuments");
  });

  it("DELETE /api/users/delete-user/:id  → deleteUser", async () => {
    const res = await request(app).delete("/api/users/delete-user/abc");
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("deleteUser");
  });

  it("PUT  /api/users/reassign-role      → reassignUserRole", async () => {
    const res = await request(app)
      .put("/api/users/reassign-role")
      .send({ userId: "u2", newRole: "admin" });
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("reassignUserRole");
  });

  it("GET  /api/users/getUserById/:id    → getSingleUser", async () => {
    const res = await request(app).get("/api/users/getUserById/xyz");
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("getSingleUser");
  });

  it("GET  /api/users/:userId            → getUserById", async () => {
    const res = await request(app).get("/api/users/789");
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("getUserById");
  });

  it("GET  /api/users/:userId/documents  → getUserDocumentsById", async () => {
    const res = await request(app).get("/api/users/789/documents");
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("getUserDocumentsById");
  });

  it("PUT  /api/users/:user_id           → updateUser", async () => {
    const res = await request(app).put("/api/users/abc").send({ name: "Z" });
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("updateUser");
  });
});
