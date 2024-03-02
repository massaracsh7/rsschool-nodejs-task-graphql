import { GraphQLFloat, GraphQLInputObjectType, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import { UUIDType } from './uuid.js';
import { profileType } from './profileType.js';
import { PrismaClient } from '@prisma/client';
import { postType } from './postType.js';

export const userType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
    posts: {
      type: new GraphQLList(postType),
      async resolve(user: { id: string }, _, context: { prisma: PrismaClient }) {
        const result = await context.prisma.post.findMany({
          where: { authorId: user.id },
        });
        return result;
      },
    },
    profile: {
      type: profileType,
      async resolve(user: { id: string }, _, context: { prisma: PrismaClient }) {
        const result = await context.prisma.profile.findFirst({
          where: { userId: user.id },
        });
        return result;
      },
    },
    userSubscribedTo: {
      type: new GraphQLList(userType),
      async resolve(user: { id: string }, _, context: { prisma: PrismaClient }) {
        const arr = await context.prisma.subscribersOnAuthors.findMany({
          where: { subscriberId: user.id },
        });
        const result = await context.prisma.user.findMany({
          where: {
            id: {
              in: arr.map((user) => user.authorId),
            },
          },
        });
        return result;
      },
    },
    subscribedToUser: {
      type: new GraphQLList(userType),
      async resolve(user: { id: string }, _, context: { prisma: PrismaClient }) {
        const arr = await context.prisma.subscribersOnAuthors.findMany({
          where: { authorId: user.id },
        });
        const result = await context.prisma.user.findMany({
          where: {
            id: {
              in: arr.map((user) => user.subscriberId),
            },
          },
        });
        return result;
      },
    },
  }),
});

export const CreateUserInput = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: () => ({
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: GraphQLFloat },
  }),
});
export const ChangeUserInput = new GraphQLInputObjectType({
  name: 'ChangeUserInput',
  fields: () => ({
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
  }),
});

export interface User {
  id: string;
  name: string;
  balance: number;
  userSubscribedTo: [{
    subscriberId: string;
    authorId: string;
  }];
  subscribedToUser: [{
    subscriberId: string;
    authorId: string;
  }];
}