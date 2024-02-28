import {  GraphQLEnumType, GraphQLFloat, GraphQLInt,  GraphQLNonNull, GraphQLObjectType } from 'graphql';

export enum MemberTypeId {
  BASIC = 'basic',
  BUSINESS = 'business',
}


export const memberTypeIdEnum = new GraphQLEnumType({
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