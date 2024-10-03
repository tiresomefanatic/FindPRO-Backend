import { Request, Response, request } from 'express';
import { 
  createGigService, 
  getGigByIdService, 
  updateGigService, 
  deleteGigService, 
  getGigsService,
  getGigsByCategoryService,
  bookmarkGigService,
  getBookmarkedGigsService,
  makeGigLiveService,
  makeGigDraftService,
  getMyGigsService,
  getGigsByOwnerService,
  deleteImageFromPortfolioMediaService,
  recordInteractionService
} from '../services/gigService';




export const createGig = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    //const ownerId = req.params.id

    const ownerId = new Types.ObjectId (req.userId);

 
    const savedGig = await createGigService(ownerId);
    res.status(201).json(savedGig);
  } catch (error) {
    console.error('Error creating gig:', error);
    res.status(500).json({ error: 'An error occurred while creating the gig' });
  }
};

// ...

export const updateGig = async (req: Request, res: Response): Promise<void> => {
  try {
    const gigId = req.params.id;
    const updateData = req.body;

    console.log("update data", updateData)


    if (updateData.faqs) {
      const hasEmptyFields = updateData.faqs.some(
        (faq: { question: string; answer: string }) =>
          faq.question.trim() === '' || faq.answer.trim() === ''
      );

      if (hasEmptyFields) {
        res.status(400).json({ error: 'Question and answer fields cannot be empty.' });
        return;
      }
    }

    const updatedGig = await updateGigService(gigId, updateData);

     
    // if (!updatedGig) {
    //   res.status(404).json({ error: 'Gig not found' });
    //   return;
    // }

    res.status(200).json(updatedGig);
  } catch (error) {
    console.error('Error updating gig:', error);
    res.status(500).json({ error: 'An error occurred while updating the gig' });
  }
};

export const deleteGig = async (req: Request, res: Response): Promise<void> => {
  try {
    const gigId = req.params.id;
    const deletedGig = await deleteGigService(gigId); 

    if (!deletedGig) {
      res.status(404).json({ error: 'Gig not found' });
      return;
    }

    res.status(200).json({ message: 'Gig deleted successfully' });
  } catch (error) {
    console.error('Error deleting gig:', error);
    res.status(500).json({ error: 'An error occurred while deleting the gig' });
  }
};

export const getGigById = async (req: Request, res: Response): Promise<void> => {
  try {
    const gigId = req.params.id;
    const gig = await getGigByIdService(gigId)

    if (!gig) {
      res.status(404).json({ error: 'Gig not found' });
      return;
    }

    res.status(200).json(gig);
  } catch (error) {
    console.error('Error fetching gig:', error);
    res.status(500).json({ error: 'An error occurred while fetching the gig' });
  }
};

export const getGigsByOwner = async (req: Request, res: Response) => {
  try {
    const ownerId =  req.params.id;
    const gigs = await getGigsByOwnerService(ownerId);


    res.status(200).json({ gigs });
  } catch (error) {
    console.error('Error retrieving gigs by owner:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMyGigs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ownerId = new Types.ObjectId (req.userId);
    const gigs = await getMyGigsService(ownerId);

    res.status(200).json({ gigs });
  } catch (error) {
    console.error('Error retrieving gigs by owner:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getGigs = async (req: Request, res: Response) => {
  try {
    

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const category = req.query.category as string;
    const subCategory = req.query.subCategory as string;
    const searchTerm = req.query.searchTerm as string;



    const { gigs, currentPage, totalPages, totalCount } = await getGigsService(page, limit, category, subCategory, searchTerm);

    res.status(200).json({
      gigs,
      currentPage,
      totalPages,
      totalCount,
    });
  } catch (error) {
    console.error('Error retrieving gigs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getGigsByCategory = async (req: Request, res: Response) => {
  try {
    const gigsByCategory = await getGigsByCategoryService();

    res.status(200).json(gigsByCategory);
  } catch (error) {
    console.error('Error retrieving gigs by category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const bookmarkGig = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const gigId = new Types.ObjectId (req.params.gigId);
    const userId = new Types.ObjectId (req.userId);

    const result = await bookmarkGigService(userId, gigId);

    if (result.bookmarked) {
      res.status(200).json({ message: 'Gig Added', id: gigId });
    } else {
      res.status(200).json({ message: 'Gig Removed', id: gigId });
    }
  } catch (error) {
    console.error('Error bookmarking gig:', error);
    res.status(500).json({ error: 'An error occurred while bookmarking the gig' });
  }
};


export const getBookmarkedGigs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = new Types.ObjectId (req.userId);
   // const userId = '66574ed781466aa2ea03c021';

    const bookmarkedGigs = await getBookmarkedGigsService(userId);

    res.status(200).json({ bookmarkedGigs });
  } catch (error) {
    console.error('Error getting bookmarked gigs:', error);
    res.status(500).json({ error: 'An error occurred while getting bookmarked gigs' });
  }
};

export const makeGigLive = async (req: Request, res: Response): Promise<void> => {
  try {
    const gigId = req.params.id;
    const updatedGig = await makeGigLiveService(gigId);

    if (!updatedGig) {
      res.status(404).json({ error: 'Gig not found' });
      return;
    }

    res.status(200).json(updatedGig);
  } catch (error) {
    console.error('Error making gig live:', error);
    res.status(500).json({ error: 'An error occurred while making the gig live' });
  }
};

export const makeGigDraft = async (req: Request, res: Response): Promise<void> => {
  try {
    const gigId = req.params.id;
    const updatedGig = await makeGigDraftService(gigId);

    if (!updatedGig) {
      res.status(404).json({ error: 'Gig not found' });
      return;
    }

    res.status(200).json(updatedGig);
  } catch (error) {
    console.error('Error making gig draft:', error);
    res.status(500).json({ error: 'An error occurred while making the gig draft' });
  }
};

export const deleteImageFromPortfolioMedia = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { gigId } = req.params;
    const { imageUrl } = req.body;
    const updatedGig = await deleteImageFromPortfolioMediaService(gigId, imageUrl);
    res.json(updatedGig);
  } catch (error) {
    console.error('Error in deleteImageFromPortfolioMedia controller:', error);
    res.status(500).json({ message: 'Error deleting image from portfolio media', error: error });
  }
};


export const recordInteraction = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const gigId = req.params.gigId;
    const { action } = req.body;
    const userId = new Types.ObjectId(req.userId);

    if (!action) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    await recordInteractionService(gigId, userId, action);
    res.status(200).json({ message: 'Interaction recorded successfully' });
  } catch (error) {
    console.error('Error recording interaction:', error);
    if (error instanceof Error && error.message === 'Gig not found') {
      res.status(404).json({ error: 'Gig not found' });
    } else {
      res.status(500).json({ error: 'An error occurred while recording the interaction' });
    }
  }
};











































// Mock data generator
import Gig, { IGigDocument } from '../models/gigModel';
import mongoose, { ObjectId, Types } from 'mongoose';
import { AuthenticatedRequest } from '../auth/protected';

export const createMockGigs = async (req: Request, res: Response): Promise<void> => {
  try {
    const owners: mongoose.Types.ObjectId[] = [
      new mongoose.Types.ObjectId('663a8b1d8728aa615b5afe30'),
      new mongoose.Types.ObjectId('65efa43fe361348ac66842cd'),
      new mongoose.Types.ObjectId('65efa449e361348ac66842d0'),
      new mongoose.Types.ObjectId('6641214d7f491783dbdaaf89'),
      new mongoose.Types.ObjectId('6641219b7f491783dbdaaf8b'),
      new mongoose.Types.ObjectId('66412266d33b85ce73b3aba7'),
    ];

    const titles = [
      'Awesome hook title',
      'Taggade le',
      'Bomb laga denge',
      'Atluntadi Mantoni',
      'Defeat Illuminati',
      'Smooth criminal',
      'Hack Your Enenmy',
      // Add more titles as needed
    ];

    const per = ['shot', 'beat', 'page', 'verse'];
    const price = ['1', '2', '3', '4', '5', '6', '7'];

    const categories = [
      {
        name: 'Video Production',
        subcategories: ['Wedding Films', 'Social Media Videos', 'Music Videos', 'Influencer Collabs'],
      },
      {
        name: 'Video Editing',
        subcategories: ['Color Collection', 'Instagram Videos', 'Wedding Video Editors', 'Music Videos', 'Youtube Videos', 'Commercials'],
      },
      {
        name: 'Sound',
        subcategories: ['Sync Sound', 'Dubbing Artist', 'SFX Editing', 'Mixing and Mastering', 'Music Direction'],
      },
      {
        name: 'Writers',
        subcategories: ['Content Writers', 'Script Writers'],
      },
      {
        name: 'Photographers',
        subcategories: ['Fashion Photographers', 'Event Photographers'],
      },
      {
        name: 'Visual Graphics',
        subcategories: ['Social Media Animations', 'Logo and Subtitles', 'Illustrators', 'Intros and Outros', 'VFX and Motion Graphics'],
      },
    ];

    const mockGigs: IGigDocument[] = [];

    for (let i = 0; i < 100; i++) {
      const randomOwner = owners[Math.floor(Math.random() * owners.length)];
      const randomTitle = titles[Math.floor(Math.random() * titles.length)];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      const randomSubcategory = randomCategory.subcategories[Math.floor(Math.random() * randomCategory.subcategories.length)];

      const packages = [
        {
          name: 'basic',
          per: per[Math.floor(Math.random() * per.length)],
          price: price[Math.floor(Math.random() * price.length)],
          description: 'Basic package description',
        },
        {
          name: 'premium',
          per: per[Math.floor(Math.random() * per.length)],
          price: price[Math.floor(Math.random() * price.length)],
          description: 'Premium package description',
        },
        {
          name: 'custom',
          per: per[Math.floor(Math.random() * per.length)],
          price: price[Math.floor(Math.random() * price.length)],
          description: 'Custom package description',
        },
      ];

      const faqs = [
        {
          question: 'How',
          answer: 'From the back'
        },
        {
          question: 'When',
          answer: 'After 11:59 PM' 
        },
        {
          question: 'Why',
          answer: 'Biological purpose'
        }
      ]

      const mockGig: IGigDocument = new Gig({
        owner: randomOwner,
        title: randomTitle,
        category: randomCategory.name,
        subCategory: randomSubcategory,
        packages,
        faqs,
        status: 'isDraft',
        
        // Set other fields with mock data as needed
      });

      mockGigs.push(mockGig);
    }

    const savedGigs: IGigDocument[] = await Gig.insertMany(mockGigs);
    res.status(201).json(savedGigs);
  } catch (error) {
    console.error('Error creating mock gigs:', error);
    res.status(500).json({ error: 'An error occurred while creating mock gigs' });
  }
};