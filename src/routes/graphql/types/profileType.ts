import { GraphQLBoolean, GraphQLEnumType, GraphQLInt, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';

export const profileType = new GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLString) },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    userId: { type: GraphQLString }, // Assuming userId is of type String in your schema
    profileTypeId: { type: profileTypeIdEnum }, // Assuming memberTypeIdEnum is already defined
  }),
});

export const profileTypeIdEnum = new GraphQLEnumType({
  name: 'ProfileTypeId',
  values: {
    UUID: { value: 'uuid' }, // Assuming format 'uuid' maps to UUID
  },
});