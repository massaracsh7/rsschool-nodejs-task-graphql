import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { memberType } from './types/memberType.js';
import {
  GraphQLObjectType, GraphQLSchema, parse, validate
} from 'graphql';
import { graphql } from 'graphql';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { UserResolver, PostResolver, ProfileResolver, MemberTypeResolver } from './resolvers.js';
import { postType } from './types/postType.js';
import { profileType } from './types/profileType.js';
import { userType } from './types/userType.js';
import depthLimit from 'graphql-depth-limit';

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
          contextValue: fastify,
        });
      }
    },
  });
};

export default plugin;
