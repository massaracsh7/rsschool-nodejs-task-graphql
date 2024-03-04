import { GraphQLFloat, GraphQLInputObjectType, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import { UUIDType } from './uuid.js';
import { Profile, profileType } from './profileType.js';
import { PostInt, postType } from './postType.js';
import { ContextInt } from '../loader.js';
import { SubscribersOnAuthors } from '@prisma/client';

export const userType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
    posts: {
      type: new GraphQLList(postType),
      resolve: async ({ id }: UserInt, _, { postsLoader }: ContextInt) => {
        const result = await postsLoader.load(id);
        return [result];
      }
    },
    profile: {
      type: profileType,
      resolve: async ({ id }: UserInt, _, { profileLoader }: ContextInt) => {
        return await profileLoader.load(id);
      }
    },
    userSubscribedTo: {
      type: new GraphQLList(userType),
      resolve: async (source: UserInt, _, { subscribedToLoader }: ContextInt) => {
        if (source.userSubscribedTo) {
          const authorsId = source.userSubscribedTo.map((user) => user.authorId);
          return await subscribedToLoader.loadMany(authorsId);
        }
        const result = await subscribedToLoader.load(source.id);
        return [result] ?? [];
      },
    },
    subscribedToUser: {
      type: new GraphQLList(userType),
      resolve: async (source: UserInt, _, { subscribersLoader }: ContextInt) => {
        if (source.subscribedToUser) {
          const subscriberId = source.subscribedToUser.map((user) => user.subscriberId);
          return await subscribersLoader.loadMany(subscriberId);
        }
        const result = await subscribersLoader.load(source.id);
        return [result] ?? [];
      },
    },
  }),
});

export const CreateUserInput = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: () => ({
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: GraphQLFloat },
  }),
});
export const ChangeUserInput = new GraphQLInputObjectType({
  name: 'ChangeUserInput',
  fields: () => ({
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
  }),
});

export interface UserInt {
  id: string;
  name: string;
  balance: number;
  profile: Profile;
  posts: PostInt[];
  userSubscribedTo: SubscribersOnAuthors[];
  subscribedToUser: SubscribersOnAuthors[];
}

export interface Subscribe {
  userId: string,
  authorId: string,
}