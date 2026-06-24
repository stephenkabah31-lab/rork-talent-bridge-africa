import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../create-context";
import {
  getAllPosts,
  createPost,
  getPostById,
  deletePostById,
} from "../data-store";
import type { Post } from "../data-store";

export const postsRouter = createTRPCRouter({
  getFeed: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      console.log(`Fetching feed with limit ${input.limit}`);
      return {
        posts: await getAllPosts(),
        nextCursor: undefined,
      };
    }),

  create: protectedProcedure
    .input(
      z.object({
        content: z.string().min(1),
        image: z.string().optional(),
        authorId: z.string(),
        authorName: z.string(),
        authorTitle: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const newPost: Post = {
        id: Date.now().toString(),
        authorId: input.authorId,
        author: {
          id: input.authorId,
          name: input.authorName,
          title: input.authorTitle,
        },
        content: input.content,
        image: input.image,
        timestamp: "Just now",
        createdAt: new Date(),
        likes: 0,
        comments: 0,
        shares: 0,
        likedBy: [],
      };

      await createPost(newPost);

      console.log(`Created post ${newPost.id}`);

      return {
        success: true,
        post: newPost,
      };
    }),

  like: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const post = await getPostById(input.postId);

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      if (input.userId !== ctx.user?.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Unauthorized action",
        });
      }

      const isLiked = post.likedBy.includes(input.userId);

      if (isLiked) {
        post.likedBy = post.likedBy.filter((id) => id !== input.userId);
        post.likes = Math.max(0, post.likes - 1);
      } else {
        post.likedBy.push(input.userId);
        post.likes += 1;
      }

      console.log(
        `User ${input.userId} ${isLiked ? "unliked" : "liked"} post ${input.postId}`,
      );

      return {
        success: true,
        isLiked: !isLiked,
        likes: post.likes,
      };
    }),

  delete: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const post = await getPostById(input.postId);

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      if (post.authorId !== input.userId || input.userId !== ctx.user?.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Unauthorized action",
        });
      }

      await deletePostById(input.postId);

      console.log(`Deleted post ${input.postId}`);

      return {
        success: true,
      };
    }),
});
