import DataLoader from 'dataloader';
import { MemberType, Post, PrismaClient, Profile, User } from '@prisma/client';

export const initializeDataLoaders = (prisma: PrismaClient) => {
  const userLoader = new DataLoader(async (ids) => {
    const users = await prisma.user.findMany({
      where: { id: { in: ids as string[] } }, 
      include: {
        userSubscribedTo: true,
        subscribedToUser: true
      },
    });
    return ids.map((id) => users.find((user) => user.id === id));
  });

  const profileLoader = new DataLoader(async (ids) => {
    const profiles = await prisma.profile.findMany({
      where: { userId: { in: ids as string[]  } }, 
    });

    return ids.map((id) => profiles.find((profile) => profile.userId === id));
  });

  const postsLoader = new DataLoader(async (ids) => {
    const posts = await prisma.post.findMany({
      where: { authorId: { in: ids as string[] } }, // Cast readonly array to mutable using spread operator
    });

    return ids.map((id) => posts.find((post) => post.authorId === id));
  });

  const memberLoader = new DataLoader(async (ids) => {
    const memberTypes = await prisma.memberType.findMany({
      where: { id: { in: ids as string[] } }, // Cast readonly array to mutable using spread operator
    });

    return ids.map((id) => memberTypes.find((memberType) => memberType.id === id));
  });

  const subscribedToLoader = new DataLoader(async (ids: readonly string[]) => {
    const subscribeTo = await prisma.subscribersOnAuthors.findMany({
        where: {
          subscriberId: { in: ids as string[]},
        },
        select: {
          subscriberId: true,
          author: true,
        },
      });

    return ids.map((id) => subscribeTo.find((sub) => sub.subscriberId === id)?.author);
    });

  const subscribersLoader = new DataLoader(async (ids: readonly string[]) => {
      const subscribers = await prisma.subscribersOnAuthors.findMany({
        where: {
          authorId: { in: ids as string[] },
        },
        select: {
          subscriber: true,
          authorId: true,
        },
      });
    return ids.map((id) => subscribers.find((sub) => sub.authorId === id)?.subscriber);
    });


  return {
    userLoader,
    profileLoader,
    postsLoader,
    memberLoader,
    subscribedToLoader,
    subscribersLoader
  };
};

export interface IContext {
  prisma: PrismaClient;
  memberTypeLoader: DataLoader<string, MemberType>;
  profileLoader: DataLoader<string, Profile>;
  postsLoader: DataLoader<string, Post[]>;
  usersLoader: DataLoader<string, User>;
  subscribedToLoader: DataLoader<string, User>;
  subscribersLoader: DataLoader<string, User>;
}