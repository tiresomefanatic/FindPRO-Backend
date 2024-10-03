import { ObjectId, Types } from "mongoose";
import Gig, { IGigDocument } from "../models/gigModel";
import User from "../models/usersModel";

export const createGigService = async (
  ownerId: Types.ObjectId
): Promise<IGigDocument> => {
  const ownerUser = await User.findById(ownerId);
  if (!ownerUser) {
    throw new Error("Invalid owner");
  }

  const defaultPackages = [
    { name: "Basic", title: "", per: "", price: "", description: "" },
    { name: "Premium", title: "", per: "", price: "", description: "" },
    { name: "Custom", title: "", per: "", price: "", description: "" },
  ];

  const newGig: IGigDocument = new Gig({
    owner: ownerUser.id,
    title: "Draft",
    packages: defaultPackages,
    faqs: [],
    status: "isDraft",
  });

  const savedGig: IGigDocument = await newGig.save();
  return savedGig;
};

// ...

export const updateGigService = async (
  gigId: string,
  updateData: Partial<IGigDocument>
): Promise<IGigDocument | null> => {
  const updatedGig = await Gig.findByIdAndUpdate(gigId, updateData, {
    new: true,
  });
  return updatedGig;
};

export const deleteGigService = async (
  gigId: string
): Promise<IGigDocument | null> => {
  try {
    const deletedGig = await Gig.findByIdAndDelete(gigId);

    if (deletedGig) {
      // Remove the deleted gig's ID from all users' bookmarkedGigs array
      await User.updateMany(
        { bookmarkedGigs: gigId },
        { $pull: { bookmarkedGigs: gigId } }
      );
    }

    return deletedGig;
  } catch (error) {
    console.error("Error deleting gig:", error);
    throw new Error("Failed to delete gig");
  }
};

export const getGigByIdService = async (
  gigId: string
): Promise<IGigDocument | null> => {
  const gig = await Gig.findOne({ _id: gigId })
    .populate({
      path: "owner",
      model: "User",
      select: "name skills profilePic location languages phoneNumber",
    })
    .exec();
  return gig;
};

export const getGigsService = async (
  page: number,
  limit: number,
  category?: string,
  subCategory?: string,
  searchTerm?: string
) => {
  const skip = (page - 1) * limit;

  const query = Gig.find().populate({
    path: "owner",
    model: "User",
    select: "name skills profilePic",
  });

  const filterConditions: any = { status: "isLive" };

  if (searchTerm) {
    const searchRegex = new RegExp(searchTerm, "i");

    filterConditions.$or = [
      { category: searchRegex },
      { subCategory: searchRegex },
    ];
  } else {
    if (category) {
      filterConditions.category = category;
    }
    if (subCategory) {
      filterConditions.subCategory = subCategory;
    }
  }

  query.setQuery(filterConditions);

  const totalCount = await Gig.countDocuments(query.getQuery());
  const totalPages = Math.ceil(totalCount / limit);

  const gigs = await query
    .skip(skip)
    .limit(limit)
    .sort({ category: 1, subcategory: 1 })
    .exec();

  return {
    gigs,
    currentPage: page,
    totalPages,
    totalCount,
  };
};

export const getMyGigsService = async (ownerId: Types.ObjectId) => {
  try {
    const gigs = await Gig.find({ owner: ownerId })
      .populate("owner", "name skills profilePic")
      .sort({ updatedAt: -1 })
      .exec();
    return gigs;
  } catch (error) {
    throw new Error("Failed to retrieve gigs by owner");
  }
};

export const getGigsByOwnerService = async (ownerId: string) => {
  try {
    const gigs = await Gig.find({ owner: ownerId, status: 'isLive' })
      .populate("owner", "name skills profilePic")
      .sort({ updatedAt: -1 })
      .exec();
    return gigs;
  } catch (error) {
    throw new Error("Failed to retrieve gigs by owner");
  }
};

export const getGigsByCategoryService = async () => {
  try {
    const gigsByCategory = await Gig.aggregate([
      {
        $match: {
          status: "isLive",
        },
      },

      {
        $group: {
          _id: "$category",
          gigs: { $push: "$$ROOT" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "gigs.owner",
          foreignField: "_id",
          as: "owner",
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          gigs: {
            $map: {
              input: "$gigs",
              as: "gig",
              in: {
                _id: "$$gig._id",
                owner: {
                  $arrayElemAt: [
                    {
                      $map: {
                        input: {
                          $filter: {
                            input: "$owner",
                            as: "user",
                            cond: { $eq: ["$$user._id", "$$gig.owner"] },
                          },
                        },
                        as: "user",
                        in: {
                          _id: "$$user._id",
                          name: "$$user.name",
                          skills: "$$user.skills",
                          profilePic: "$$user.profilePic",
                        },
                      },
                    },
                    0,
                  ],
                },
                title: "$$gig.title",
                packages: `$$gig.packages`,
                portfolioMedia: "$$gig.portfolioMedia",
                // Include other fields as needed
              },
            },
          },
        },
      },
      {
        $sort: {
          category: 1,
        },
      },
    ]).exec();

    return gigsByCategory;
  } catch (error) {
    throw new Error("Failed to retrieve gigs by category");
  }
};

export const bookmarkGigService = async (
  userId: Types.ObjectId,
  gigId: Types.ObjectId
): Promise<{ bookmarked: boolean }> => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const isBookmarked = user.bookmarkedGigs.some((id) => id.equals(gigId));

  if (isBookmarked) {
    // Remove the gigId from the bookmarkedGigs array
    user.bookmarkedGigs = user.bookmarkedGigs.filter((id) => !id.equals(gigId));
  } else {
    // Add the gigId to the bookmarkedGigs array
    user.bookmarkedGigs.push(gigId);
  }

  await user.save();


  return { bookmarked: !isBookmarked };
};

export const getBookmarkedGigsService = async (userId: Types.ObjectId ) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const bookmarkedGigIds = user.bookmarkedGigs;

    const bookmarkedGigsByCategory = await Gig.aggregate([
      {
        $match: {
          _id: { $in: bookmarkedGigIds },
          status: "isLive",
        },
      },
      {
        $group: {
          _id: "$category",
          gigs: { $push: "$$ROOT" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "gigs.owner",
          foreignField: "_id",
          as: "owner",
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          gigs: {
            $map: {
              input: "$gigs",
              as: "gig",
              in: {
                _id: "$$gig._id",
                owner: {
                  $arrayElemAt: [
                    {
                      $map: {
                        input: {
                          $filter: {
                            input: "$owner",
                            as: "user",
                            cond: { $eq: ["$$user._id", "$$gig.owner"] },
                          },
                        },
                        as: "user",
                        in: {
                          _id: "$$user._id",
                          name: "$$user.name",
                          skills: "$$user.skills",
                          profilePic: "$$user.profilePic",
                        },
                      },
                    },
                    0,
                  ],
                },
                title: "$$gig.title",
                packages: "$$gig.packages",
                portfolioMedia: "$$gig.portfolioMedia",
                // Include other fields as needed
              },
            },
          },
        },
      },
      {
        $sort: {
          category: 1,
        },
      },
    ]).exec();

    return bookmarkedGigsByCategory;
  } catch (error) {
    console.log("Error occurred in bookmarked gigs", error);
    throw new Error("Failed to retrieve bookmarked gigs");
  }
};

export const makeGigLiveService = async (
  gigId: string
): Promise<IGigDocument | null> => {
  const gig = await Gig.findById(gigId);

  if (!gig) {
    return null;
  }

  const requiredFields: (keyof IGigDocument)[] = [
    "title",
    "description",
    "category",
    "subCategory",
    "packages",
  ];

  for (const field of requiredFields) {
    if (!gig[field] || (Array.isArray(gig[field]) && gig[field].length === 0)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  gig.status = "isLive";
  const updatedGig = await gig.save();

  return updatedGig;
};

export const makeGigDraftService = async (
  gigId: string
): Promise<IGigDocument | null> => {
  const gig = await Gig.findById(gigId);

  if (!gig) {
    return null;
  }

  gig.status = "isDraft";
  const updatedGig = await gig.save();

  return updatedGig;
};

export const deleteImageFromPortfolioMediaService = async (gigId: string, imageUrl: string) => {
  const updatedGig = await Gig.findByIdAndUpdate(
    gigId,
    { $pull: { portfolioMedia: { src: imageUrl } } },
    { new: true, runValidators: true }
  );

  if (!updatedGig) {
    throw new Error('Gig not found');
  }
  return updatedGig;
};

export const recordInteractionService = async (
  gigId: string,
  userId: Types.ObjectId,
  action: 'contact_viewed' | 'phone_viewed' | 'whatsapp_clicked'
): Promise<void> => {
  try {
    const gig = await Gig.findById(gigId);

    if (!gig) {
      throw new Error('Gig not found');
    }

    const existingInteraction = gig.interactions.find(
      interaction => interaction.userId.toString() === userId.toString()
    );

    if (existingInteraction) {
      // Update existing interaction
      existingInteraction[action] += 1;
      existingInteraction.lastInteraction = new Date();
    } else {
      // Create new interaction
      gig.interactions.push({
        userId,
        contact_viewed: action === 'contact_viewed' ? 1 : 0,
        phone_viewed: action === 'phone_viewed' ? 1 : 0,
        whatsapp_clicked: action === 'whatsapp_clicked' ? 1 : 0,
        lastInteraction: new Date(),
      });
    }

    await gig.save();
  } catch (error) {
    console.error('Error recording interaction:', error);
    throw new Error('Failed to record interaction');
  }
};