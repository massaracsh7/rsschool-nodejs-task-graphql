import { GraphQLBoolean, GraphQLEnumType, GraphQLInputObjectType, GraphQLInt, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import { memberType, memberTypeIdEnum } from './memberType.js';
import { UUIDType } from './uuid.js';
import { ContextInt } from '../loader.js';

export const profileType = new GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLString) },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    userId: { type: GraphQLString },
    memberTypeId: { type: memberTypeIdEnum },
    memberType: {
      type: memberType,
      resolve: async ({ memberTypeId }: Profile, _, { memberTypeLoader }: ContextInt) => {
        return await memberTypeLoader.load(memberTypeId);
      }
},
  }),
});

export const profileTypeIdEnum = new GraphQLEnumType({
  name: 'ProfileTypeId',
  values: {
    UUID: { value: 'uuid' },
  },
});

export const CreateProfileInput = new GraphQLInputObjectType({
  name: 'CreateProfileInput',
  fields: () => ({
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    memberTypeId: { type: memberTypeIdEnum },
    userId: { type: UUIDType },
  }),
});

export const ChangeProfileInput = new GraphQLInputObjectType({
  name: 'ChangeProfileInput',
  fields: () => ({
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    memberTypeId: { type: memberTypeIdEnum },
  }),
});
export interface Profile {
  id: string;
  isMale: boolean;
  yearOfBirth: number;
  userId: string;
  memberTypeId: string;
}