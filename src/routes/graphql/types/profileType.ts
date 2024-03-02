import { GraphQLBoolean, GraphQLEnumType, GraphQLInputObjectType, GraphQLInt, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import { memberType, memberTypeIdEnum } from './memberType.js';
import { UUIDType } from './uuid.js';
import { PrismaClient } from '@prisma/client';

export const profileType = new GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLString) },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    userId: { type: GraphQLString },
    memberType: {
      type: memberType,
      async resolve(profile: { memberTypeId: string }, _, context: { prisma: PrismaClient }) {
        const result = await context.prisma.memberType.findFirst({
          where: { id: profile.memberTypeId },
        });
        return result;
      }},
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