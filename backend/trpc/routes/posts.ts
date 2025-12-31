import * as z from "zod";
import { createTRPCRouter, publicProcedure } from "../create-context";

interface Post {
  id: string;
  authorId: string;
  author: {
    id: string;
    name: string;
    title: string;
    profilePicture?: string;
    isVerified?: boolean;
  };
  content: string;
  image?: string;
  timestamp: string;
  createdAt: Date;
  likes: number;
  comments: number;
  shares: number;
  likedBy: string[];
}

const mockPosts: Post[] = [
  {
    id: "1",
    authorId: "u1",
    author: {
      id: "u1",
      name: "Amara Okafor",
      title: "Talent Acquisition Lead",
      isVerified: true,
    },
    content:
      "We are looking for talented software developers to join our growing team. Multiple positions available across West Africa. Competitive compensation and growth opportunities. Reach out if interested! 🚀\n\n#TechJobs #AfricaTech #Careers",
    timestamp: "2h ago",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    likes: 234,
    comments: 45,
    shares: 12,
    likedBy: [],
  },
  {
    id: "2",
    authorId: "u2",
    author: {
      id: "u2",
      name: "Kwame Mensah",
      title: "Product Strategy Consultant",
    },
    content:
      "Had an amazing session with entrepreneurs discussing digital innovation strategies. The talent and creativity in Africa continues to impress! 🌍\n\nReminder: Focus on solving real problems for your users first.",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800",
    timestamp: "4h ago",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    likes: 567,
    comments: 89,
    shares: 34,
    likedBy: [],
  },
  {
    id: "3",
    authorId: "u3",
    author: {
      id: "u3",
      name: "Zainab Hassan",
      title: "Design Lead | Digital Agency",
      isVerified: true,
    },
    content:
      "Design insight: Consistency creates trust! 🎨\n\nWhen working on digital products, maintaining consistent patterns helps users feel comfortable and confident. Small details make a big difference.\n\nWhat design principles do you follow?",
    timestamp: "6h ago",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    likes: 892,
    comments: 156,
    shares: 67,
    likedBy: [],
  },
];

export const postsRouter = createTRPCRouter({
  getFeed: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().optional(),
      })
    )
    .query(({ input }) => {
      console.log(`Fetching feed with limit ${input.limit}`);
      return {
        posts: mockPosts,
        nextCursor: undefined,
      };
    }),

  create: publicProcedure
    .input(
      z.object({
        content: z.string().min(1),
        image: z.string().optional(),
        authorId: z.string(),
        authorName: z.string(),
        authorTitle: z.string(),
      })
    )
    .mutation(({ input }) => {
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

      mockPosts.unshift(newPost);

      console.log(`Created post ${newPost.id}`);

      return {
        success: true,
        post: newPost,
      };
    }),

  like: publicProcedure
    .input(
      z.object({
        postId: z.string(),
        userId: z.string(),
      })
    )
    .mutation(({ input }) => {
      const post = mockPosts.find((p) => p.id === input.postId);

      if (!post) {
        throw new Error("Post not found");
      }

      const isLiked = post.likedBy.includes(input.userId);

      if (isLiked) {
        post.likedBy = post.likedBy.filter((id) => id !== input.userId);
        post.likes = Math.max(0, post.likes - 1);
      } else {
        post.likedBy.push(input.userId);
        post.likes += 1;
      }

      console.log(`User ${input.userId} ${isLiked ? "unliked" : "liked"} post ${input.postId}`);

      return {
        success: true,
        isLiked: !isLiked,
        likes: post.likes,
      };
    }),

  delete: publicProcedure
    .input(
      z.object({
        postId: z.string(),
        userId: z.string(),
      })
    )
    .mutation(({ input }) => {
      const postIndex = mockPosts.findIndex((p) => p.id === input.postId);

      if (postIndex === -1) {
        throw new Error("Post not found");
      }

      if (mockPosts[postIndex].authorId !== input.userId) {
        throw new Error("Unauthorized");
      }

      mockPosts.splice(postIndex, 1);

      console.log(`Deleted post ${input.postId}`);

      return {
        success: true,
      };
    }),
});
