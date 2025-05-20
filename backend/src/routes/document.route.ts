import express from "express";
import {
  uploadFileToS3,
  getAllTask,
  SendFileToAUser,
  getSingleTask,
  downloadFile,
  getPresignedUrl,
  getMyDocuments,
  deleteDocument,
  updateDocument,
  hardDelete,
  requestDocumentSignatures,
  signDocument,
  getDocumentsRequiringSignature,
  signDocumentWithCanvas,
  getDocumentById,
  getDocumentWithRevisions,
  saveDocumentEdit,
  submitDocumentForReview,
  reviewDocument,
  getPendingReviews,
  approveRevision,
  rejectRevision,
} from "../controller/document.controller";
import { upload } from "../lib/multerconfig";
import { userAuth } from "../middleware/userAuth";
import { preserveBody } from "../middleware/preserveBody";
import authorizeRoles from "../middleware/roleMiddleware";

export const router = express.Router();

// Routes for all authenticated users
router.post("/upload", userAuth, preserveBody, upload.single("file"), uploadFileToS3);
router.get("/singleTask/:id", userAuth, getSingleTask);
router.get("/download/:documentId", userAuth, downloadFile);
router.get("/presigned-url/:documentId", userAuth, getPresignedUrl);
router.get("/my-documents", userAuth, getMyDocuments);
router.get("/document/:id", userAuth, getDocumentById);

// SOFT DELETE already check condition in controller only admin or the one upload it can delete
router.delete("/delete/:documentId", userAuth, deleteDocument);

// Hard Delete
router.delete("/deleteHard/:documentId", userAuth, hardDelete);

// Update document metadata (only uploader or admin)
router.put("/update/:documentId", userAuth, upload.single("file"), updateDocument);

// Routes requiring admin or employee role
router.get("/alltask", userAuth, authorizeRoles("admin", "employee"), getAllTask);

router.post("/sendFileToUser/:IdOfUser", userAuth, SendFileToAUser);

router.post("/share-document/:IdOfUser", userAuth, SendFileToAUser);

// Request signatures for a document
router.post("/request-signatures/:documentId", userAuth, requestDocumentSignatures);

// Sign a document (any authorized user who is requested to sign)
router.post("/sign/:documentId", userAuth, signDocument);

router.get("/pending-signatures", userAuth, getDocumentsRequiringSignature);

router.post("/sign-with-canvas/:documentId", userAuth,upload.single("signature"),signDocumentWithCanvas);

// New Routeeeeeeeeeeeeeeeeeeee

router.get("/document-with-revisions/:documentId", userAuth, getDocumentWithRevisions);

router.post("/save-edit/:documentId", userAuth, upload.single("file"), saveDocumentEdit);

router.post("/submit-for-review/:documentId", userAuth, submitDocumentForReview);

router.post("/review/:documentId", userAuth, reviewDocument);

router.post("/approve/:documentId/:revisionId", userAuth, approveRevision);

router.post("/reject/:documentId/:revisionId", userAuth, rejectRevision);

router.get("/pending-reviews", userAuth, authorizeRoles("admin"), getPendingReviews);