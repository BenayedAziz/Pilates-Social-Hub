import { pgTable, text, integer, boolean, timestamp, real, serial, jsonb, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============= USERS =============
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  displayName: varchar("display_name", { length: 100 }).notNull(),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  level: varchar("level", { length: 20 }).notNull().default("beginner"), // beginner, intermediate, advanced
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users);
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// ============= STUDIOS =============
export const studios = pgTable("studios", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  neighborhood: varchar("neighborhood", { length: 100 }).notNull(),
  description: text("description"),
  address: text("address"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  coordX: real("coord_x"), // for map display
  coordY: real("coord_y"),
  price: integer("price").notNull(), // base class price
  rating: real("rating").default(0),
  reviewCount: integer("review_count").default(0),
  imageUrl: text("image_url"),
  amenities: jsonb("amenities").$type<string[]>().default([]),
  googlePlaceId: text("google_place_id"),
  website: text("website"),
  phone: varchar("phone", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertStudioSchema = createInsertSchema(studios);
export type Studio = typeof studios.$inferSelect;
export type NewStudio = typeof studios.$inferInsert;

// ============= COACHES =============
export const coaches = pgTable("coaches", {
  id: serial("id").primaryKey(),
  studioId: integer("studio_id").references(() => studios.id).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  bio: text("bio"),
  specialties: jsonb("specialties").$type<string[]>().default([]),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCoachSchema = createInsertSchema(coaches);
export type Coach = typeof coaches.$inferSelect;

// ============= CLASSES =============
export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  studioId: integer("studio_id").references(() => studios.id).notNull(),
  coachId: integer("coach_id").references(() => coaches.id),
  title: varchar("title", { length: 200 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // reformer, mat, cadillac, etc.
  level: varchar("level", { length: 20 }).notNull(), // beginner, intermediate, advanced
  description: text("description"),
  duration: integer("duration").notNull(), // minutes
  maxCapacity: integer("max_capacity").notNull().default(12),
  price: integer("price").notNull(),
  scheduledAt: timestamp("scheduled_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertClassSchema = createInsertSchema(classes);
export type PilatesClass = typeof classes.$inferSelect;

// ============= BOOKINGS =============
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  classId: integer("class_id").references(() => classes.id).notNull(),
  studioId: integer("studio_id").references(() => studios.id).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("confirmed"), // confirmed, cancelled, completed
  timeSlot: varchar("time_slot", { length: 10 }), // "09:00", "11:30", etc.
  bookedAt: timestamp("booked_at").defaultNow().notNull(),
  cancelledAt: timestamp("cancelled_at"),
});

export const insertBookingSchema = createInsertSchema(bookings);
export type Booking = typeof bookings.$inferSelect;

// ============= WAITLIST =============
export const waitlist = pgTable("waitlist", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  classId: integer("class_id").references(() => classes.id).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("waiting"), // waiting, promoted, expired
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  promotedAt: timestamp("promoted_at"),
});

export const insertWaitlistSchema = createInsertSchema(waitlist);
export type WaitlistEntry = typeof waitlist.$inferSelect;

// ============= POSTS (Social Feed) =============
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: varchar("type", { length: 100 }).notNull(), // session type: "Reformer Advanced", etc.
  studio: varchar("studio", { length: 200 }),
  duration: integer("duration"), // minutes
  calories: integer("calories"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPostSchema = createInsertSchema(posts);
export type Post = typeof posts.$inferSelect;

// ============= POST LIKES =============
export const postLikes = pgTable("post_likes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============= POST COMMENTS =============
export const postComments = pgTable("post_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============= FORUM POSTS =============
export const forumPosts = pgTable("forum_posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: varchar("title", { length: 300 }).notNull(),
  body: text("body").notNull(),
  category: varchar("category", { length: 50 }).notNull(), // Technique, Nutrition, Studios, Gear, Challenges
  flair: varchar("flair", { length: 20 }), // Beginner, Intermediate, Advanced
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertForumPostSchema = createInsertSchema(forumPosts);
export type ForumPostRecord = typeof forumPosts.$inferSelect;

// ============= FORUM VOTES =============
export const forumVotes = pgTable("forum_votes", {
  id: serial("id").primaryKey(),
  forumPostId: integer("forum_post_id").references(() => forumPosts.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  direction: varchar("direction", { length: 4 }).notNull(), // "up" or "down"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============= FORUM COMMENTS =============
export const forumComments = pgTable("forum_comments", {
  id: serial("id").primaryKey(),
  forumPostId: integer("forum_post_id").references(() => forumPosts.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============= FOLLOWS =============
export const follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").references(() => users.id).notNull(),
  followingId: integer("following_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============= PRODUCTS =============
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  brand: varchar("brand", { length: 100 }).notNull(),
  description: text("description"),
  price: integer("price").notNull(), // in cents for precision, or whole euros
  rating: real("rating").default(0),
  category: varchar("category", { length: 50 }).notNull(), // Apparel, Mats, Equipment, Accessories, Recovery
  imageUrl: text("image_url"),
  externalUrl: text("external_url"), // link to brand's real product page
  badge: varchar("badge", { length: 50 }),
  inStock: boolean("in_stock").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProductSchema = createInsertSchema(products);
export type Product = typeof products.$inferSelect;

// ============= ORDERS =============
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, confirmed, shipped, delivered, cancelled
  totalAmount: integer("total_amount").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOrderSchema = createInsertSchema(orders);
export type Order = typeof orders.$inferSelect;

// ============= ORDER ITEMS =============
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull().default(1),
  priceAtPurchase: integer("price_at_purchase").notNull(),
});

// ============= WISHLIST =============
export const wishlistItems = pgTable("wishlist_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============= BADGES =============
export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  iconName: varchar("icon_name", { length: 50 }).notNull(), // lucide icon name
  criteria: jsonb("criteria").$type<Record<string, number>>(), // e.g. { sessions: 100 }
});

export const insertBadgeSchema = createInsertSchema(badges);
export type BadgeRecord = typeof badges.$inferSelect;

// ============= USER BADGES =============
export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  badgeId: integer("badge_id").references(() => badges.id).notNull(),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
});

// ============= REVIEWS =============
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  studioId: integer("studio_id").references(() => studios.id).notNull(),
  rating: integer("rating").notNull(), // 1-5
  text: text("text"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertReviewSchema = createInsertSchema(reviews);
export type Review = typeof reviews.$inferSelect;

// ============= GOOGLE REVIEWS =============
export const googleReviews = pgTable("google_reviews", {
  id: serial("id").primaryKey(),
  studioId: integer("studio_id").references(() => studios.id).notNull(),
  googleReviewId: text("google_review_id"),
  authorName: text("author_name").notNull(),
  authorPhotoUrl: text("author_photo_url"),
  rating: integer("rating").notNull(),
  text: text("text"),
  relativeTimeDescription: text("relative_time_description"),
  time: integer("time"), // unix timestamp from Google
  language: text("language"),
  fetchedAt: timestamp("fetched_at").defaultNow().notNull(),
});

export type GoogleReview = typeof googleReviews.$inferSelect;

// ============= CONVERSATIONS =============
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const conversationParticipants = pgTable("conversation_participants", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversations.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversations.id).notNull(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  readAt: timestamp("read_at"),
});

// ============= RELATIONS =============
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  bookings: many(bookings),
  forumPosts: many(forumPosts),
  reviews: many(reviews),
  orders: many(orders),
  earnedBadges: many(userBadges),
  followers: many(follows, { relationName: "following" }),
  following: many(follows, { relationName: "follower" }),
}));

export const studiosRelations = relations(studios, ({ many }) => ({
  coaches: many(coaches),
  classes: many(classes),
  bookings: many(bookings),
  reviews: many(reviews),
  googleReviews: many(googleReviews),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, { fields: [posts.userId], references: [users.id] }),
  likes: many(postLikes),
  comments: many(postComments),
}));

export const forumPostsRelations = relations(forumPosts, ({ one, many }) => ({
  author: one(users, { fields: [forumPosts.userId], references: [users.id] }),
  votes: many(forumVotes),
  comments: many(forumComments),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, { fields: [follows.followerId], references: [users.id], relationName: "follower" }),
  following: one(users, { fields: [follows.followingId], references: [users.id], relationName: "following" }),
}));
