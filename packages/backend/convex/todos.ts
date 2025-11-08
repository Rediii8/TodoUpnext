import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

async function requireUserId(ctx: any) {
	const identity = await ctx.auth.getUserIdentity();
	if (!identity) {
		throw new Error("Not authenticated");
	}
	return identity.subject;
}

export const getAll = query({
	handler: async (ctx) => {
		const userId = await requireUserId(ctx);
		return await ctx.db
			.query("todos")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.collect();
	},
});

export const create = mutation({
  args: {
    text: v.string(),
		dueDate: v.optional(v.string()),
		details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const newTodoId = await ctx.db.insert("todos", {
      text: args.text,
      completed: false,
      userId,
      dueDate: args.dueDate ?? undefined,
			details: args.details ? args.details.trim() || undefined : undefined,

    });
    return await ctx.db.get(newTodoId);
  },
});

export const toggle = mutation({
	args: {
		id: v.id("todos"),
		completed: v.boolean(),
	},
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);
		const todo = await ctx.db.get(args.id);
		if (!todo || todo.userId !== userId) {
			throw new Error("Todo not found");
		}
		await ctx.db.patch(args.id, { completed: args.completed });
		return { success: true };
	},
});

export const deleteTodo = mutation({
	args: {
		id: v.id("todos"),
	},
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);
		const todo = await ctx.db.get(args.id);
		if (!todo || todo.userId !== userId) {
			throw new Error("Todo not found");
		}
		await ctx.db.delete(args.id);
		return { success: true };
	},
});

export const updateTodo = mutation({
	args: {
		id: v.id("todos"),
		text: v.optional(v.string()),
		dueDate: v.optional(v.string()),
		details: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);
		const todo = await ctx.db.get(args.id);
		if (!todo || todo.userId !== userId) throw new Error("Unauthorized");

		const patch: Record<string, any> = {};
		if (args.text !== undefined) {
			patch.text = args.text;
		}
		if (args.dueDate !== undefined) {
			patch.dueDate = args.dueDate ? args.dueDate : undefined;
		}
		if (args.details !== undefined) {
			const cleaned = args.details.trim();
			patch.details = cleaned ? cleaned : undefined;
		}

		if (Object.keys(patch).length === 0) {
			return { success: true };
		}

		await ctx.db.patch(args.id, patch);
		return { success: true };
	},
});

export const getById = query({
	args: {
		id: v.id("todos"),
	},
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);
		const todo = await ctx.db.get(args.id);
		if (!todo || todo.userId !== userId) {
			return null;
		}
		return todo;
	},
});
