import { type DailyStats, type GptResponse, type User, type PageViewSource, type Task, type File, Campaign, Share } from 'wasp/entities';
import { HttpError } from 'wasp/server';
import {
  type GetGptResponses,
  type GetDailyStats,
  type GetPaginatedUsers,
  type GetAllTasksByUser,
  type GetAllFilesByUser,
  type GetDownloadFileSignedURL,
  type GetUserCampaigns,
  GetCampaignById,
  GetSharesByCampaign,
} from 'wasp/server/operations';
import { getDownloadFileSignedURLFromS3 } from './file-upload/s3Utils.js';

type DailyStatsWithSources = DailyStats & {
  sources: PageViewSource[];
};

type DailyStatsValues = {
  dailyStats: DailyStatsWithSources;
  weeklyStats: DailyStatsWithSources[];
};

export const getGptResponses: GetGptResponses<void, GptResponse[]> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }
  return context.entities.GptResponse.findMany({
    where: {
      user: {
        id: context.user.id,
      },
    },
  });
};

export const getAllTasksByUser: GetAllTasksByUser<void, Task[]> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }
  return context.entities.Task.findMany({
    where: {
      user: {
        id: context.user.id,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const getAllFilesByUser: GetAllFilesByUser<void, File[]> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }
  return context.entities.File.findMany({
    where: {
      user: {
        id: context.user.id,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const getDownloadFileSignedURL: GetDownloadFileSignedURL<{ key: string }, string> = async (
  { key },
  _context
) => {
  return await getDownloadFileSignedURLFromS3({ key });
};

export const getDailyStats: GetDailyStats<void, DailyStatsValues> = async (_args, context) => {
  if (!context.user?.isAdmin) {
    throw new HttpError(401);
  }
  const dailyStats = await context.entities.DailyStats.findFirstOrThrow({
    orderBy: {
      date: 'desc',
    },
    include: {
      sources: true,
    },
  });

  const weeklyStats = await context.entities.DailyStats.findMany({
    orderBy: {
      date: 'desc',
    },
    take: 7,
    include: {
      sources: true,
    },
  });

  return { dailyStats, weeklyStats };
};

type GetPaginatedUsersInput = {
  skip: number;
  cursor?: number | undefined;
  hasPaidFilter: boolean | undefined;
  emailContains?: string;
  subscriptionStatus?: string[];
};
type GetPaginatedUsersOutput = {
  users: Pick<
    User,
    'id' | 'email' | 'username' | 'lastActiveTimestamp' | 'hasPaid' | 'subscriptionStatus' | 'stripeId'
  >[];
  totalPages: number;
};

export const getPaginatedUsers: GetPaginatedUsers<GetPaginatedUsersInput, GetPaginatedUsersOutput> = async (
  args,
  context
) => {
  let subscriptionStatus = args.subscriptionStatus?.filter((status) => status !== 'hasPaid');
  subscriptionStatus = subscriptionStatus?.length ? subscriptionStatus : undefined;

  const queryResults = await context.entities.User.findMany({
    skip: args.skip,
    take: 10,
    where: {
      email: {
        contains: args.emailContains || undefined,
        mode: 'insensitive',
      },
      hasPaid: args.hasPaidFilter,
      subscriptionStatus: {
        in: subscriptionStatus || undefined,
      },
    },
    select: {
      id: true,
      email: true,
      username: true,
      lastActiveTimestamp: true,
      hasPaid: true,
      subscriptionStatus: true,
      stripeId: true,
    },
    orderBy: {
      id: 'desc',
    },
  });

  const totalUserCount = await context.entities.User.count({
    where: {
      email: {
        contains: args.emailContains || undefined,
      },
      hasPaid: args.hasPaidFilter,
      subscriptionStatus: {
        in: subscriptionStatus || undefined,
      },
    },
  });
  const totalPages = Math.ceil(totalUserCount / 10);

  return {
    users: queryResults,
    totalPages,
  };
};

export const getUserCampaigns: GetUserCampaigns<void, Campaign[]> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  let campaigns = await context.entities.Campaign.findMany({
    where: {
      user: {
        id: context.user.id,
      },
    },
  });
  return campaigns;
}

export const getCampaignById: GetCampaignById<{ campaignId: number }, Campaign | null> = async ({ campaignId }, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  let campaign = await context.entities.Campaign.findFirst({
    where: {
      id: campaignId,
      user: {
        id: context.user.id,
      },
    },
  });

  if (!campaign) {
    throw new HttpError(404, 'Campaign not found');
  }

  return campaign;
}

export const getSharesByCampaign: GetSharesByCampaign<{ campaignId: number }, Share[]> = async ({ campaignId }, context) => {
  let shares = await context.entities.Share.findMany({
    where: {
      campaign: {
        id: campaignId,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return shares;
}
