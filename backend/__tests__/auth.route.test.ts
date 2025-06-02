import express from "express";
import request from "supertest";
import { router as authRouter } from "../src/routes/auth.route";
import { Request, Response, NextFunction } from "express";

jest.mock("../src/controller/auth.controller", () => ({
  Login:        jest.fn((_, res) => res.status(200).json({ handler: "Login" })),
  Register:     jest.fn((_, res) => res.status(200).json({ handler: "Register" })),
  logout:       jest.fn((_, res) => res.status(200).json({ handler: "logout" })),
  sendVerifyOtp:jest.fn((_, res) => res.status(200).json({ handler: "sendVerifyOtp" })),
  verifiedEmail:jest.fn((_, res) => res.status(200).json({ handler: "verifiedEmail" })),
  isAuthenticated: jest.fn((_, res) => res.status(200).json({ handler: "isAuthenticated" })),
  sendResetOtp: jest.fn((_, res) => res.status(200).json({ handler: "sendResetOtp" })),
  resetPassword: jest.fn((_, res) => res.status(200).json({ handler: "resetPassword" })),
  getUserById:  jest.fn((_, res) => res.status(200).json({ handler: "getUserById" })),
  adminCreateUser: jest.fn((_, res) => res.status(200).json({ handler: "adminCreateUser" })),
}));

jest.mock("../src/middleware/userAuth", () => ({
  userAuth: (_req: Request, _res: Response, next: NextFunction) => next(),
}));

describe("Auth Routes", () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/api/auth", authRouter);
  });

  it("POST /api/auth/login → Login", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "a@b.com", password: "123" });
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("Login");
  });

  it("POST /api/auth/register → Register", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "x", email: "a@b.com", password: "123" });
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("Register");
  });

  it("POST /api/auth/logout → logout", async () => {
    const res = await request(app).post("/api/auth/logout");
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("logout");
  });

  it("POST /api/auth/send-verify-otp → sendVerifyOtp", async () => {
    const res = await request(app)
      .post("/api/auth/send-verify-otp")
      .send({ user_id: "u1" });
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("sendVerifyOtp");
  });

  it("POST /api/auth/verify-account → verifiedEmail", async () => {
    const res = await request(app)
      .post("/api/auth/verify-account")
      .send({ user_id: "u1", otp: "000000" });
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("verifiedEmail");
  });

  it("GET /api/auth/is-auth → isAuthenticated", async () => {
    const res = await request(app).get("/api/auth/is-auth");
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("isAuthenticated");
  });

  it("POST /api/auth/send-reset-otp → sendResetOtp", async () => {
    const res = await request(app)
      .post("/api/auth/send-reset-otp")
      .send({ email: "a@b.com" });
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("sendResetOtp");
  });

  it("POST /api/auth/reset-password → resetPassword", async () => {
    const res = await request(app)
      .post("/api/auth/reset-password")
      .send({ email: "a@b.com", otp: "000000", newPassword: "new" });
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("resetPassword");
  });

  it("GET /api/auth/test-getUserById → getUserById", async () => {
    const res = await request(app).get("/api/auth/test-getUserById");
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("getUserById");
  });

  it("POST /api/auth/admin/create-user → adminCreateUser", async () => {
    const res = await request(app)
      .post("/api/auth/admin/create-user")
      .send({ user_id: "admin", name: "X", email: "x@y.com", role: "user" });
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("adminCreateUser");
  });
});