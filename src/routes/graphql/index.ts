import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLSchema, graphql } from 'graphql';
import { PrismaClient } from '@prisma/client';
import { UUIDType } from './types/uuid.js';
import { memberType, memberTypeIdEnum } from './types/memberType.js';
import { profileType } from './types/profileType.js';
import { postType } from './types/postType.js';

const queryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    memberTypes: {
      type: new GraphQLList(memberType),
      resolve: (parent, args, context: { prisma: PrismaClient }) => {
        return context.prisma.memberType.findMany();
      },
    },
    profiles: {
      type: new GraphQLList(profileType),
      resolve: (parent, args, context) => {
        return context.prisma.profile.findMany();
      },
    },
    posts: {
      type: new GraphQLList(postType),
      resolve: (parent, args, context) => {
        return context.prisma.post.findMany();
      },
    },
    memberType: {
      type: memberType,
      args: {
        id: { type: new GraphQLNonNull(memberTypeIdEnum) },
      },
      resolve: async (parent, args: { id: string }, context) => {
        return await context.prisma.memberType.findUnique({
          where: { id: args.id },
        });
      },
    },
    post: {
      type: postType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (parent, args: { id: string }, context) => {
        return await context.prisma.post.findUnique({
          where: { id: args.id },
        });
      },
    },
    profile: {
      type: profileType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (parent, args: { id: string }, context) => {
        return await context.prisma.profile.findUnique({
          where: { id: args.id },
        });
      },
    },
  },
});

const schema = new GraphQLSchema({
  query: queryType,
  types: [memberType, postType, profileType],
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
