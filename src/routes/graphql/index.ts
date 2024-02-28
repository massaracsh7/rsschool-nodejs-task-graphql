import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { GraphQLBoolean, GraphQLEnumType, GraphQLFloat, GraphQLInputObjectType, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLSchema, GraphQLString, graphql } from 'graphql';
import { PrismaClient } from '@prisma/client';
import { UUIDType } from './types/uuid.js';
enum MemberTypeId {
  BASIC = 'basic',
  BUSINESS = 'business',
}


const memberTypeIdEnum = new GraphQLEnumType({
  name: 'MemberTypeId',
  values: {
    [MemberTypeId.BASIC]: { value: MemberTypeId.BASIC },
    [MemberTypeId.BUSINESS]: { value: MemberTypeId.BUSINESS },
  },
});



export const memberType = new GraphQLObjectType({
  name: 'Member',
  fields: () => ({
    id: { type: new GraphQLNonNull(memberTypeIdEnum) },
    discount: { type: GraphQLFloat },
    postsLimitPerMonth: { type: GraphQLInt },
  }),
});

export const profileType = new GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLString) },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    userId: { type: GraphQLString }, // Assuming userId is of type String in your schema
    memberTypeId: { type: memberTypeIdEnum }, // Assuming memberTypeIdEnum is already defined
  }),
});

export const profileTypeIdEnum = new GraphQLEnumType({
  name: 'ProfileTypeId',
  values: {
    UUID: { value: 'uuid' }, // Assuming format 'uuid' maps to UUID
  },
});
export const postType = new GraphQLObjectType({
  name: 'Post',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLString) },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    authorId: { type: GraphQLString },
  }),
});

// Define the GraphQL enum type for post formats
export const postFormatEnum = new GraphQLEnumType({
  name: 'PostFormat',
  values: {
    UUID: { value: 'uuid' },
  },
});

interface MyContext {
  prisma: PrismaClient;
}

const queryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    memberTypes: {
      type: new GraphQLList(memberType),
      async resolve(parent, args, context: { prisma: PrismaClient }) {
        return await context.prisma.memberType.findMany();
      },
    },
    profiles: {
      type: new GraphQLList(profileType),
      async resolve(parent, args, context ) {
        return await context.prisma.profile.findMany();
      },
    },
    posts: {
      type: new GraphQLList(postType),
      async resolve(parent, args, context) {
        return await context.prisma.post.findMany();
      },
    },
    memberType: {
      type: memberType,
      args: {
        id: { type: new GraphQLNonNull(memberTypeIdEnum) },
      },
      async resolve(parent, args: { id: string }, context) {
        const memberType = await context.prisma.memberType.findUnique({
          where: { id: args.id },
        });
        return memberType;
      },
    },
    post: {
      type: postType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      async resolve(parent, args: { id: string }, context) {
        const post = await context.prisma.post.findUnique({
          where: { id: args.id },
        });
        return post;
      },
    },
    profile: {
      type: profileType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      async resolve(parent, args: { id: string }, context) {
        const profile = await context.prisma.profile.findUnique({
          where: { id: args.id },
        });
        return profile;
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
