/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { GraphQLList, GraphQLNonNull, GraphQLBoolean } from 'graphql';
import { PrismaClient, Post, Profile, User } from '@prisma/client';
import { ChangeUserInput, CreateUserInput, userType } from './types/userType.js';
import { UUIDType } from './types/uuid.js';
import { ChangePostInput, CreatePostInput, postType } from './types/postType.js';
import { ChangeProfileInput, CreateProfileInput, profileType } from './types/profileType.js';
import { memberType, memberTypeIdEnum } from './types/memberType.js';


export const UserResolver = {
  Query: {
    users: {
      type: new GraphQLList(userType),
      async resolve(_, context: { prisma: PrismaClient }) {
        return await context.prisma.user.findMany();
      },
    },
    user: {
      type: userType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      async resolve(_, args: { id: string }, context: { prisma: PrismaClient }) {
        return context.prisma.user.findFirst({
          where: { id: args.id },
        });
      },
    },
  },
  Mutation: {
    createUser: {
      type: userType,
      args: { dto: { type: CreateUserInput } },
      async resolve(_, args: { dto: User }, context: { prisma: PrismaClient }) {
        return context.prisma.user.create({
          data: args.dto,
        });
      },
    },
    changeUser: {
      type: userType,
      args: { dto: { type: ChangeUserInput }, id: { type: UUIDType } },
      async resolve(_, args: { dto: User; id: string }, context: { prisma: PrismaClient }) {
        return context.prisma.user.update({
          where: { id: args.id },
          data: args.dto,
        });
      },
    },
    deleteUser: {
      type: GraphQLBoolean,
      args: { id: { type: UUIDType } },
      async resolve(_, args: { id: string }, context: { prisma: PrismaClient }) {
        await context.prisma.user.delete({
          where: {
            id: args.id,
          },
        });
        return true;
      },
    },
    subscribeTo: {
      type: userType,
      args: { userId: { type: UUIDType }, authorId: { type: UUIDType } },
      async resolve(_, args: { userId: string; authorId: string }, context: { prisma: PrismaClient }) {
        return await context.prisma.user.update({
          where: {
            id: args.userId,
          },
          data: {
            userSubscribedTo: {
              create: {
                authorId: args.authorId,
              },
            },
          },
        });
      },
    },
    unsubscribeFrom: {
      type: GraphQLBoolean,
      args: { userId: { type: UUIDType }, authorId: { type: UUIDType } },
      async resolve(_, args: { userId: string; authorId: string }, context: { prisma: PrismaClient }) {
        await context.prisma.subscribersOnAuthors.delete({
          where: {
            subscriberId_authorId: {
              subscriberId: args.userId,
              authorId: args.authorId,
            },
          },
        });
        return true;
      },
    },
  }
};

export const PostResolver = {
  Query: {
    posts: {
      type: new GraphQLList(postType),
      resolve(_, context: { prisma: PrismaClient }) {
        return context.prisma.post.findMany();
      },
    },
    post: {
      type: postType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      async resolve(_, args: { id: string }, context: { prisma: PrismaClient }) {
        return context.prisma.post.findFirst({
          where: { id: args.id },
        });
      },
    },
  },
  Mutation: {
    createPost: {
      type: postType,
      args: { dto: { type: CreatePostInput } },
      async resolve(_, args: { dto: Post }, context: { prisma: PrismaClient }) {
        return context.prisma.post.create({
          data: args.dto,
        });
      },
    },
    changePost: {
      type: postType,
      args: { dto: { type: ChangePostInput }, id: { type: UUIDType } },
      async resolve(_, args: { dto: Post, id: string }, context: { prisma: PrismaClient }) {
        return context.prisma.post.update({
          where: { id: args.id },
          data: args.dto,
        });
      },
    },
    deletePost: {
      type: GraphQLBoolean,
      args: { id: { type: UUIDType } },
      async resolve(_, args: { id: string }, context: { prisma: PrismaClient }) {
        await context.prisma.post.delete({
          where: {
            id: args.id,
          },
        });
        return true;
      },
    },
  },
};

export const ProfileResolver = {
  Query: {
    profiles: {
      type: new GraphQLList(profileType),
      resolve(_, context: { prisma: PrismaClient }) {
        return context.prisma.profile.findMany();
      },
    },
    profile: {
      type: profileType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      async resolve(_, args: { id: string }, context: { prisma: PrismaClient }) {
        return context.prisma.profile.findFirst({
          where: { id: args.id },
        });
      },
    },
  },
  Mutation: {
    createProfile: {
      type: profileType,
      args: { dto: { type: CreateProfileInput } },
      async resolve(_, args: { dto: Profile }, context: { prisma: PrismaClient }) {
        return context.prisma.profile.create({
          data: args.dto,
        });
      },
    },
    changeProfile: {
      type: profileType,
      args: { dto: { type: ChangeProfileInput }, id: { type: UUIDType } },
      async resolve(_, args: { dto: Profile; id: string }, context: { prisma: PrismaClient }) {
        return context.prisma.profile.update({
          where: { id: args.id },
          data: args.dto,
        });
      },
    },
    deleteProfile: {
      type: GraphQLBoolean,
      args: { id: { type: UUIDType } },
      async resolve(_, args: { id: string }, context: { prisma: PrismaClient }) {
        await context.prisma.profile.delete({
          where: {
            id: args.id,
          },
        });
        return true;
      },
    },
  },
};

export const MemberTypeResolver = {
  Query: {
    memberTypes: {
      type: new GraphQLList(memberType),
      resolve(_, context: { prisma: PrismaClient }) {
        return context.prisma.memberType.findMany();
      },
    },
    memberType: {
      type: memberType,
      args: {
        id: { type: new GraphQLNonNull(memberTypeIdEnum) },
      },
      async resolve(_, args: { id: string }, context: { prisma: PrismaClient }) {
        return context.prisma.memberType.findFirst({
          where: { id: args.id },
        });
      },
    },
  },
};
