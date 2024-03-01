/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { memberType } from './types/memberType.js';
import {
  GraphQLObjectType, GraphQLSchema
} from 'graphql';
import { graphql } from 'graphql';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { UserResolver, PostResolver, ProfileResolver, MemberTypeResolver } from './resolvers.js';
import { postType } from './types/postType.js';
import { profileType } from './types/profileType.js';
import { userType } from './types/userType.js';

const Query = new GraphQLObjectType({
  name: 'Query',
  fields: {
    ...UserResolver.Query,
    ...PostResolver.Query,
    ...ProfileResolver.Query,
    ...MemberTypeResolver.Query
  }
});

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    ...UserResolver.Mutation,
    ...PostResolver.Mutation,
    ...ProfileResolver.Mutation
  }
});

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
