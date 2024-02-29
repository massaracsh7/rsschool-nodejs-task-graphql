/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { PrismaClient} from '@prisma/client';
import { UUIDType } from './types/uuid.js';
import { memberType, memberTypeIdEnum } from './types/memberType.js';
import { postType } from './types/postType.js';
import { userType } from './types/userType.js';
import { profileType } from './types/profileType.js';
import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLSchema
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
        const result = await context.prisma.memberType.findUnique({
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
        const result = await context.prisma.post.findUnique({
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
        const result = await context.prisma.profile.findUnique({
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
        const result = await context.prisma.user.findUnique({
          where: { id: args.id },
        });
        return result;
      },
    },

  },
});

const schema = new GraphQLSchema({
  query: Query,
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
