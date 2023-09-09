import { v } from 'convex/values'
import { query } from './_generated/server'

export default query({
  args: {
    identifier: v.string(),
    hash: v.string(),
  },
  handler: async (ctx, args) => {
    const previewInfo = await ctx.db.query('previewInfo').first()
    if (previewInfo === null) {
      // This isn't a preview instance so just return
      return { success: 'success' }
    }
    console.log(args, previewInfo)
    if (
      previewInfo.identifier !== args.identifier ||
      previewInfo.hash !== args.hash
    ) {
      return {
        error:
          "This deployment isn't configured to preview this branch and hash",
      }
    } else if (previewInfo.status !== 'ready') {
      return {
        error: "This deployment isn't ready for preview yet.",
      }
    }
    return { success: 'success' }
  },
})
