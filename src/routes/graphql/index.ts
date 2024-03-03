import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { GraphQLObjectType, GraphQLSchema, parse, validate } from 'graphql';
import { graphql } from 'graphql';
import depthLimit from 'graphql-depth-limit';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { UserResolver, PostResolver, ProfileResolver, MemberTypeResolver } from './resolvers.js';
import { initializeDataLoaders } from './loader.js';
import { memberType } from './types/memberType.js';
import { postType } from './types/postType.js';
import { profileType } from './types/profileType.js';
import { userType } from './types/userType.js';
import { PrismaClient } from '@prisma/client';

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      ...UserResolver.Query,
      ...PostResolver.Query,
      ...ProfileResolver.Query,
      ...MemberTypeResolver.Query
    }
  }),
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      ...UserResolver.Mutation,
      ...PostResolver.Mutation,
      ...ProfileResolver.Mutation
    }
  }),
  types: [memberType, postType, profileType, userType]
});

const prisma = new PrismaClient();

const dataLoaders = initializeDataLoaders(prisma);

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
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
      const ast = parse(query);
      const validationErrors = validate(schema, ast, [depthLimit(5)]);
      if (validationErrors.length > 0) {
        return { errors: validationErrors };
      } else {
        return graphql({
          schema,
          source: query,
          variableValues: variables,
          contextValue: { ...fastify, dataLoaders },
        });
      }
    },
  });
};

export default plugin;
