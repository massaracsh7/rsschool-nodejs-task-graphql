import { MemberType, Post, PrismaClient, Profile, User } from '@prisma/client';
import DataLoader from 'dataloader';

export const initDataLoaders = (prisma: PrismaClient) => {
  const memberTypeLoader = () => {
    return new DataLoader(async (ids: readonly string[]) => {
      const memberTypes = await prisma.memberType.findMany({
        where: { id: { in: ids as string[] } }, // Casting readonly string[] to string[]
      });

      return ids.map((id) => memberTypes.find((memberType) => memberType.id === id));
    });
  };

  const usersLoader = () => {
    return new DataLoader(async (ids: readonly string[]) => {
      const users = await prisma.user.findMany({
        where: { id: { in: ids as string[] } }, // Casting readonly string[] to string[]
        include: {
          subscribedToUser: true,
          userSubscribedTo: true,
        },
      });

      return ids.map((id) => users.find((user) => user.id === id));
    });
  };

  const subscribedToLoader = () => {
    return new DataLoader(async (ids: readonly string[]) => {
      const subscribers = await prisma.subscribersOnAuthors.findMany({
        where: {
          subscriberId: { in: ids as string[] }, // Casting readonly string[] to string[]
        },
        select: {
          subscriberId: true,
          author: true,
        },
      });

      return ids.map((id) => subscribers.find((sub) => sub.subscriberId === id)?.author);
    });
  };

  const subscribersLoader = () => {
    return new DataLoader(async (ids: readonly string[]) => {
      const subs = await prisma.subscribersOnAuthors.findMany({
        where: {
          authorId: { in: ids as string[] }, // Casting readonly string[] to string[]
        },
        select: {
          subscriber: true,
          authorId: true,
        },
      });
      return ids.map((id) => subs.find((sub) => sub.authorId === id)?.subscriber);
    });
  };

  const profileLoader = () => {
    return new DataLoader(async (ids: readonly string[]) => {
      const profiles = await prisma.profile.findMany({
        where: { userId: { in: ids as string[] } },
      });

      return ids.map((id) => profiles.find((profile) => profile.userId === id));
    });
  };

  const postsLoader = () => {
    return new DataLoader(async (ids: readonly string[]) => {
      const posts = await prisma.post.findMany({
        where: { authorId: { in: ids as string[] } },
      });
      return ids.map((id) => posts.find((post) => post.authorId === id));
    });
  };

  return {
    memberTypeLoader: memberTypeLoader(),
    profileLoader: profileLoader(),
    postsLoader: postsLoader(),
    usersLoader: usersLoader(),
    subscribedToLoader: subscribedToLoader(),
    subscribersLoader: subscribersLoader(),
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
