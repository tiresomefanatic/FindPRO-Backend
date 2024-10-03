import express, { Request, Response } from 'express';
import {
  createGig,
  getGigById,
  updateGig,
  deleteGig,
  getGigs,
  getMyGigs,
  createMockGigs,
  getGigsByCategory,
  bookmarkGig,
  getBookmarkedGigs,
  makeGigLive,
  makeGigDraft,
  getGigsByOwner,
  deleteImageFromPortfolioMedia,
  recordInteraction
} from '../controllers/gigController';
import { authMiddleware } from '../auth/protected';

const router = express.Router();

// GET routes
router.get('/', getGigs);
router.get('/gigs-by-category', getGigsByCategory);
router.get('/getGigById/:id', getGigById);
router.get('/getBookmarkedGigs', authMiddleware, getBookmarkedGigs);
router.get('/myGigs', authMiddleware, getMyGigs);
router.get('/userGigs/:id', getGigsByOwner);

// POST routes
router.post('/createGig', authMiddleware, createGig);
router.post('/create-mock-gigs', createMockGigs);
router.post('/bookmarkGig/:gigId', authMiddleware, bookmarkGig);
router.post('/:gigId/recordInteraction', authMiddleware, recordInteraction);


// PUT routes
router.put('/:id', authMiddleware, updateGig);
router.put('/make-gig-live/:id', authMiddleware, makeGigLive);
router.put('/make-gig-draft/:id', authMiddleware, makeGigDraft);
router.put('/deleteImageFromPortfolioMedia/:gigId', authMiddleware, deleteImageFromPortfolioMedia);


// DELETE routes
router.delete('/:id', authMiddleware, deleteGig);

export default router;