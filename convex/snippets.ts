import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";

export const createSnippet = mutation({
    args: {
        title: v.string(),
        code: v.string(),
        language: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) throw new ConvexError("Not Authenticated")
        const user = await ctx.db
            .query("users")
            .withIndex("by_user_id")
            .filter(q => q.eq(q.field("userId"), identity.subject))
            .first()

        if (!user) throw new ConvexError("User not found")

        const snippetId = ctx.db.insert("snippets", {
            userId: identity.subject,
            title: args.title,
            code: args.code,
            language: args.language,
            userName: user.name,
        })
        return snippetId
    }

})

export const getAllSnippets = query({
    handler: async (ctx) => {
        const snippets = await ctx.db.query("snippets").order("desc").collect()
        return snippets
    }
})

export const deleteSnippet = mutation({
    args: {
        snippetId: v.id("snippets")
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) throw new ConvexError("Not Authenticated")

        const snippet = await ctx.db.get(args.snippetId)
        if (!snippet) throw new ConvexError("Snippet not found")

        if (snippet.userId !== identity.subject) throw new ConvexError("Not Authorized to delete this snippet")

        const comments = await ctx.db
            .query("snippetComments")
            .withIndex("by_snippet_id")
            .filter(q => q.eq(q.field("snippetId"), args.snippetId))
            .collect()

        for (const comment of comments) {
            await ctx.db.delete(comment._id)
        }

        const stars = await ctx.db
            .query("stars")
            .withIndex("by_snippet_id")
            .filter(q => q.eq(q.field("snippetId"), args.snippetId))
            .collect()

        for (const star of stars) {
            await ctx.db.delete(star._id)
        }

        await ctx.db.delete(args.snippetId)
    }
})

export const starSnippet = mutation({
    args: {
        snippetId: v.id("snippets")
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) throw new ConvexError("Not Authenticated")

        const starExisting = await ctx.db
            .query("stars")
            .withIndex("by_user_id_and_snippet_id")
            .filter(q => q.and(
                q.eq(q.field("userId"), identity.subject),
                q.eq(q.field("snippetId"), args.snippetId)
            ))
            .first()

        if (starExisting) {
            await ctx.db.delete(starExisting._id)
        }
        else {
            await ctx.db.insert("stars", {
                userId: identity.subject,
                snippetId: args.snippetId
            })
        }
    }


})

export const isSnippetStarred = query({
    args: {
        snippetId: v.id("snippets")
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) return false
        const star = await ctx.db
            .query("stars")
            .withIndex("by_user_id_and_snippet_id")
            .filter(q => q.and(
                q.eq(q.field("userId"), identity.subject),
                q.eq(q.field("snippetId"), args.snippetId)
            ))
            .first()

        return !!star
    }
})

export const getSnippetStarCount = query({
    args: {
        snippetId: v.id("snippets")
    },
    handler: async (ctx, args) => {
        const stars = await ctx.db
            .query("stars")
            .withIndex("by_snippet_id")
            .filter(q => q.eq(q.field("snippetId"), args.snippetId))
            .collect()
        return stars.length
    }

})

export const getSnippetById = query({
    args: {
        snippetId: v.id("snippets")
    },
    handler: async (ctx, args) => {
        const snippet = await ctx.db.get(args.snippetId)
        if (!snippet) throw new ConvexError("Snippet not found")

        return snippet
    }
})

export const getComments = query({
    args: {
        snippetId: v.id("snippets")
    },
    handler: async (ctx, args) => {
        const comments = await ctx.db
            .query("snippetComments")
            .withIndex("by_snippet_id")
            .filter(q => q.eq(q.field("snippetId"), args.snippetId))
            .order("desc")
            .collect()
        return comments
    }
})


export const addComments=mutation({
    args:{
        snippetId:v.id("snippets"),
        content:v.string()
    },
    handler:async(ctx,args)=>{
        const identity=await ctx.auth.getUserIdentity()
        if(!identity) throw new ConvexError("Not Authenticated")

        const user=await ctx.db
            .query("users")
            .withIndex("by_user_id")
            .filter(q=>q.eq(q.field("userId"),identity.subject))
            .first()
        
        if(!user) throw new ConvexError("User not found")
        
        return await ctx.db.insert("snippetComments",{
            userId:identity.subject,
            snippetId:args.snippetId,
            content:args.content,
            userName:user.name
        })
    }
})

export const deleteComment=mutation({
    args:{
        commentId:v.id("snippetComments"),
    },
    handler:async(ctx,args)=>{
        const identity=await ctx.auth.getUserIdentity()
        if(!identity) throw new ConvexError("Not Authenticated")
        
        const comment=await ctx.db.get(args.commentId)
        if(!comment) throw new ConvexError("Comment not found")
        
        if(comment.userId!==identity.subject) throw new ConvexError("Not Authorized to delete this comment")
        
        await ctx.db.delete(args.commentId)
        }
})

export const getStarredSnippets=query({
    handler:async(ctx)=>{
        const identity=await ctx.auth.getUserIdentity()
        if(!identity) return []
        const stars=await ctx.db
            .query("stars")
            .withIndex("by_user_id")
            .filter(q=>q.eq(q.field("userId"),identity.subject))
            .collect()
        
        const snippets=await Promise.all(stars.map(star=>ctx.db.get(star.snippetId)))
        return snippets.filter((snippet)=>snippet!==null)
    }
})