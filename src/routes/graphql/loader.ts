import { MemberType, Post, PrismaClient, Profile, User } from '@prisma/client';
import DataLoader from 'dataloader';

export function initDataLoaders(prisma: PrismaClient) {
  function usersLoaderFunc() {
    return new DataLoader(async (ids: readonly string[]) => {
      const result = await prisma.user.findMany({
        where: { id: { in: ids as string[] | undefined } },
        include: {
          subscribedToUser: true,
          userSubscribedTo: true,
        },
      });
      return ids.map((id) => result.find((item) => item.id === id));
    });
  }

  function subscribedToLoaderFunc() {
    return new DataLoader(async (ids: readonly string[]) => {
      const result = await prisma.subscribersOnAuthors.findMany({
        where: {
          subscriberId: { in: ids as string[] | undefined },
        },
        select: {
          author: true,
          subscriberId: true,
        },
      });

      return ids.map((id) => result.find((item) => item.subscriberId === id)?.author);
    });
  }

  function subscribersLoaderFunc() {
    return new DataLoader(async (ids: readonly string[]) => {
      const result = await prisma.subscribersOnAuthors.findMany({
        where: {
          authorId: { in: ids as string[] | undefined },
        },
        include: {
          subscriber: true
        },
      });
      return ids.map((id) => result.find((item) => item.authorId === id)?.subscriber);
    });
  }

  function profileLoaderFunc() {
    return new DataLoader(async (ids: readonly string[]) => {
      const result = await prisma.profile.findMany({
        where: { userId: { in: ids as string[] } },
      });
      return ids.map((id) => result.find((item) => item.userId === id));
    });
  }

  function postsLoaderFunc() {
    return new DataLoader(async (ids: readonly string[]) => {
      const result = await prisma.post.findMany({
        where: { authorId: { in: ids as string[] | undefined } },
      });
      return ids.map((id) => result.find((item) => item.authorId === id));
    });
  }

  function memberTypeLoaderFunc() {
    return new DataLoader(async (ids: readonly string[]) => {
      const result = await prisma.memberType.findMany({
        where: { id: { in: ids as string[] | undefined } },
      });
      return ids.map((id) => result.find((item) => item.id === id));
    });
  }

  return {
    usersLoader: usersLoaderFunc(),
    subscribedToLoader: subscribedToLoaderFunc(),
    subscribersLoader: subscribersLoaderFunc(),
    memberTypeLoader: memberTypeLoaderFunc(),
    profileLoader: profileLoaderFunc(),
    postsLoader: postsLoaderFunc(),
  };
}

export interface ContextInt {
  prisma: PrismaClient;
  memberTypeLoader: DataLoader<string, MemberType>;
  profileLoader: DataLoader<string, Profile>;
  postsLoader: DataLoader<string, Post[]>;
  usersLoader: DataLoader<string, User>;
  subscribedToLoader: DataLoader<string, User | null>;
  subscribersLoader: DataLoader<string, User | null>;
}
