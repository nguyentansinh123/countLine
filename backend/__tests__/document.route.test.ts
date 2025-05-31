import express from "express";
import request from "supertest";
import { router as documentRouter } from "../src/routes/document.route";
import { Request, Response, NextFunction } from "express";

// Mock all controller handlers
jest.mock("../src/controller/document.controller", () => ({
  uploadFileToS3:               jest.fn((_, res: Response) => res.status(200).json({ handler: "uploadFileToS3" })),
  getSingleTask:                jest.fn((_, res: Response) => res.status(200).json({ handler: "getSingleTask" })),
  downloadFile:                 jest.fn((_, res: Response) => res.status(200).json({ handler: "downloadFile" })),
  getPresignedUrl:              jest.fn((_, res: Response) => res.status(200).json({ handler: "getPresignedUrl" })),
  getMyDocuments:               jest.fn((_, res: Response) => res.status(200).json({ handler: "getMyDocuments" })),
  getDocumentById:              jest.fn((_, res: Response) => res.status(200).json({ handler: "getDocumentById" })),
  updateDocumentStatus:         jest.fn((_, res: Response) => res.status(200).json({ handler: "updateDocumentStatus" })),
  deleteDocument:               jest.fn((_, res: Response) => res.status(200).json({ handler: "deleteDocument" })),
  hardDelete:                   jest.fn((_, res: Response) => res.status(200).json({ handler: "hardDelete" })),
  updateDocument:               jest.fn((_, res: Response) => res.status(200).json({ handler: "updateDocument" })),
  getAllTask:                   jest.fn((_, res: Response) => res.status(200).json({ handler: "getAllTask" })),
  SendFileToAUser:              jest.fn((_, res: Response) => res.status(200).json({ handler: "SendFileToAUser" })),
  SendFileToTeam:               jest.fn((_, res: Response) => res.status(200).json({ handler: "SendFileToTeam" })),
  requestDocumentSignatures:    jest.fn((_, res: Response) => res.status(200).json({ handler: "requestDocumentSignatures" })),
  signDocument:                 jest.fn((_, res: Response) => res.status(200).json({ handler: "signDocument" })),
  getDocumentsRequiringSignature: jest.fn((_, res: Response) =>
    res.status(200).json({ handler: "getDocumentsRequiringSignature" })
  ),
  signDocumentWithCanvas:       jest.fn((_, res: Response) => res.status(200).json({ handler: "signDocumentWithCanvas" })),
  searchDocuments:              jest.fn((_, res: Response) => res.status(200).json({ handler: "searchDocuments" })),
  getFilesSharedWithUser:       jest.fn((_, res: Response) => res.status(200).json({ handler: "getFilesSharedWithUser" })),
  signS3Url:                    jest.fn((_, res: Response) => res.status(200).json({ handler: "signS3Url" })),
  getDocumentWithRevisions:     jest.fn((_, res: Response) => res.status(200).json({ handler: "getDocumentWithRevisions" })),
  saveDocumentEdit:             jest.fn((_, res: Response) => res.status(200).json({ handler: "saveDocumentEdit" })),
  submitDocumentForReview:      jest.fn((_, res: Response) => res.status(200).json({ handler: "submitDocumentForReview" })),
  reviewDocument:               jest.fn((_, res: Response) => res.status(200).json({ handler: "reviewDocument" })),
  approveRevision:              jest.fn((_, res: Response) => res.status(200).json({ handler: "approveRevision" })),
  rejectRevision:               jest.fn((_, res: Response) => res.status(200).json({ handler: "rejectRevision" })),
  getPendingReviews:            jest.fn((_, res: Response) => res.status(200).json({ handler: "getPendingReviews" })),
  newSendFile:                  jest.fn((_, res: Response) => res.status(200).json({ handler: "newSendFile" })),
}));

jest.mock("../src/lib/multerconfig", () => ({
  upload: { single: (_field: string) => (_req: Request, _res: Response, next: NextFunction) => next() },
}));
jest.mock("../src/middleware/userAuth", () => ({
  userAuth: (_req: Request, _res: Response, next: NextFunction) => next(),
}));
jest.mock("../src/middleware/preserveBody", () => ({
  preserveBody: (_req: Request, _res: Response, next: NextFunction) => next(),
}));
jest.mock("../src/middleware/roleMiddleware", () => ({
  __esModule: true,
  default: (..._roles: string[]) => (_req: Request, _res: Response, next: NextFunction) => next(),
}));

describe("Document Routes", () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/api/document", documentRouter);
  });

  it("POST   /api/document/upload                     → uploadFileToS3", async () => {
    const res = await request(app)
      .post("/api/document/upload")
      .attach("file", Buffer.from(""), "test.pdf")
      .field("user_id", "u1");
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("uploadFileToS3");
  });

  it("GET    /api/document/singleTask/:id              → getSingleTask", async () => {
    const res = await request(app).get("/api/document/singleTask/123");
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("getSingleTask");
  });

  it("GET    /api/document/download/:documentId        → downloadFile", async () => {
    const res = await request(app).get("/api/document/download/abc");
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("downloadFile");
  });

  it("GET    /api/document/presigned-url/:documentId   → getPresignedUrl", async () => {
    const res = await request(app).get("/api/document/presigned-url/xyz");
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("getPresignedUrl");
  });

  it("GET    /api/document/my-documents                → getMyDocuments", async () => {
    const res = await request(app).get("/api/document/my-documents");
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("getMyDocuments");
  });

  it("GET    /api/document/document/:id                → getDocumentById", async () => {
    const res = await request(app).get("/api/document/document/42");
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("getDocumentById");
  });

  it("POST   /api/document/update-status/:documentId   → updateDocumentStatus", async () => {
    const res = await request(app)
      .post("/api/document/update-status/99")
      .send({ status: "approved" });
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("updateDocumentStatus");
  });

  it("DELETE /api/document/delete/:documentId          → deleteDocument", async () => {
    const res = await request(app).delete("/api/document/delete/55");
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("deleteDocument");
  });

  it("DELETE /api/document/deleteHard/:documentId      → hardDelete", async () => {
    const res = await request(app).delete("/api/document/deleteHard/66");
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("hardDelete");
  });

  it("PUT    /api/document/update/:documentId          → updateDocument", async () => {
    const res = await request(app)
      .put("/api/document/update/77")
      .attach("file", Buffer.from(""), "new.docx");
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("updateDocument");
  });

  it("GET    /api/document/alltask                     → getAllTask", async () => {
    const res = await request(app).get("/api/document/alltask");
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("getAllTask");
  });

  it("POST   /api/document/sendFileToUser/:IdOfUser    → SendFileToAUser", async () => {
    const res = await request(app)
      .post("/api/document/sendFileToUser/u1")
      .send({ documentId: "d1", requestSignature: false });
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("SendFileToAUser");
  });

  it("POST   /api/document/sendFileToTeam/:IdOfTeam     → SendFileToTeam", async () => {
    const res = await request(app)
      .post("/api/document/sendFileToTeam/t1")
      .send({ documentId: "d2", requestSignature: true });
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("SendFileToTeam");
  });

  it("POST   /api/document/share-document/:IdOfUser     → SendFileToAUser", async () => {
    const res = await request(app)
      .post("/api/document/share-document/u2")
      .send({ documentId: "d3" });
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("SendFileToAUser");
  });

  it("POST   /api/document/request-signatures/:documentId → requestDocumentSignatures", async () => {
    const res = await request(app)
      .post("/api/document/request-signatures/d4")
      .send({ userIds: ["u1","u2"] });
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("requestDocumentSignatures");
  });

  it("POST   /api/document/sign/:documentId            → signDocument", async () => {
    const res = await request(app)
      .post("/api/document/sign/d5")
      .send({ user_id: "u3" });
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("signDocument");
  });

  it("GET    /api/document/pending-signatures          → getDocumentsRequiringSignature", async () => {
    const res = await request(app).get("/api/document/pending-signatures");
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("getDocumentsRequiringSignature");
  });

  it("POST   /api/document/sign-with-canvas/:documentId → signDocumentWithCanvas", async () => {
    const res = await request(app)
      .post("/api/document/sign-with-canvas/d6")
      .attach("signature", Buffer.from(""), "sig.png");
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("signDocumentWithCanvas");
  });

  it("GET    /api/document/search                     → searchDocuments", async () => {
    const res = await request(app).get("/api/document/search?term=test");
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("searchDocuments");
  });

  it("GET    /api/document/shared-with-me             → getFilesSharedWithUser", async () => {
    const res = await request(app).get("/api/document/shared-with-me");
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("getFilesSharedWithUser");
  });

  it("GET    /api/document/sign-s3-url                → signS3Url", async () => {
    const res = await request(app).get("/api/document/sign-s3-url?key=abc");
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("signS3Url");
  });


  it("POST   /api/document/save-edit/:documentId      → saveDocumentEdit", async () => {
    const res = await request(app)
      .post("/api/document/save-edit/d8")
      .attach("file", Buffer.from(""), "edit.pdf");
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("saveDocumentEdit");
  });

  it("POST   /api/document/submit-for-review/:documentId → submitDocumentForReview", async () => {
    const res = await request(app)
      .post("/api/document/submit-for-review/d9")
      .send({ revisionId: "r1", message: "please review" });
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("submitDocumentForReview");
  });

  it("POST   /api/document/review/:documentId         → reviewDocument", async () => {
    const res = await request(app)
      .post("/api/document/review/d10")
      .send({ revisionId: "r2", action: "approve", comments: "ok" });
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("reviewDocument");
  });

  it("POST   /api/document/approve/:documentId/:revisionId → approveRevision", async () => {
    const res = await request(app)
      .post("/api/document/approve/d11/r3")
      .send({ comments: "good" });
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("approveRevision");
  });

  it("GET    /api/document/pending-reviews            → getPendingReviews", async () => {
    const res = await request(app).get("/api/document/pending-reviews");
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("getPendingReviews");
  });

  it("POST   /api/document/senf-file/:documentId      → newSendFile", async () => {
    const res = await request(app)
      .post("/api/document/senf-file/d12")
      .send({ recipients: ["u1","u2"] });
    expect(res.status).toBe(200);
    expect(res.body.handler).toBe("newSendFile");
  });
});