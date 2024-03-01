/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Post, PrismaClient, Profile, User} from '@prisma/client';
import { UUIDType } from './types/uuid.js';
import { memberType, memberTypeIdEnum } from './types/memberType.js';
import { ChangePostInput, CreatePostInput, postType } from './types/postType.js';
import { ChangeUserInput, CreateUserInput, userType } from './types/userType.js';
import { ChangeProfileInput, CreateProfileInput, profileType } from './types/profileType.js';
import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLSchema,
  GraphQLBoolean
} from 'graphql';
import { graphql } from 'graphql';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';

const Query = new GraphQLObjectType({
  name: 'QueryType',
  fields: {
    memberTypes: {
      type: new GraphQLList(memberType),
      resolve(parent, args, context: { prisma: PrismaClient }) {
        const result = context.prisma.memberType.findMany();
        return result;
      },
    },
    posts: {
      type: new GraphQLList(postType),
      resolve(parent, args, context: { prisma: PrismaClient }) {
        const result = context.prisma.post.findMany();
        return result;
      },
    },

    profiles: {
      type: new GraphQLList(profileType),
      resolve(parent, args, context: { prisma: PrismaClient }) {
        const result = context.prisma.profile.findMany();
        return result;
      },
    },
    memberType: {
      type: memberType,
      args: {
        id: { type: new GraphQLNonNull(memberTypeIdEnum) },
      },
      async resolve(_, args: { id: string }, context) {
        const result = await context.prisma.memberType.findFirst({
          where: { id: args.id },
        });
        return result;
      },
    },
    post: {
      type: postType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      async resolve(_, args: { id: string }, context) {
        const result = await context.prisma.post.findFirst({
          where: { id: args.id },
        });
        return result;
      },
    },
    profile: {
      type: profileType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      async resolve(_, args: { id: string }, context) {
        const result = await context.prisma.profile.findFirst({
          where: { id: args.id },
        });
        return result;
      },
    },
    users: {
      type: new GraphQLList(userType),
      async resolve(parent, args, context: { prisma: PrismaClient }) {
        const result = await context.prisma.user.findMany();
        return result;
      },
    },
    user: {
      type: userType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      async resolve(_, args: { id: string }, context) {
        const result = await context.prisma.user.findFirst({
          where: { id: args.id },
        });
        return result;
      },
    },

  },
});

const Mutation = new GraphQLObjectType({
  name: 'MutationType',
  fields: {
    createPost: {
      type: postType,
      args: { dto: { type: CreatePostInput } },
      async resolve(_, args: { dto: Post }, context: { prisma: PrismaClient }) {
        const result = context.prisma.post.create({
          data: args.dto,
        });
        return result;
      },
    },
    changePost: {
      type: postType,
      args: { dto: { type: ChangePostInput }, id: { type: UUIDType } },
      async resolve(_, args: { dto: Post, id: string }, context: { prisma: PrismaClient }) {
        const result = context.prisma.post.update({
          where: { id: args.id },
          data: args.dto,
        });
        return result;
      },
    },
    createUser: {
      type: userType,
      args: { dto: { type: CreateUserInput } },
      async resolve(_, args: { dto: User }, context: { prisma: PrismaClient }) {
        return context.prisma.user.create({
          data: args.dto,
        });
      },
    },
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

    deletePost: {
      type: GraphQLBoolean,
      args: { id: { type: UUIDType } },
      async resolve(_, args: { id: string }, context: { prisma: PrismaClient }) {
        await context.prisma.post.delete({
          where: {
            id: args.id,
          },
        });
        return null;
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
        return null;
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
        return null;
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
        return null
      },
    },
  }
})

const schema = new GraphQLSchema({
  query: Query,
  mutation: Mutation,
  types: [memberType, postType, profileType, userType],
});

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      const { query, variables } = req.body;
      const result = await graphql({
        schema,
        source: query,
        contextValue: { prisma },
        variableValues: variables,
      });
      return result;
    },
  });
};

export default plugin;
