import { httpRouter } from 'convex/server'
import { httpAction } from './_generated/server'
import { internal } from './_generated/api'

const http = httpRouter()

http.route({
  path: '/reset',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const sk = new URL(request.url).searchParams.get('sk')
    if (sk !== process.env.SECRET_KEY) {
      return new Response('Invalid secret key', { status: 403 })
    }
    await ctx.runMutation(internal.init.resetPreviewInfo)
    await ctx.runMutation(internal.init.clearData)
    return new Response('success', { status: 200 })
  }),
})

http.route({
  path: '/setup',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const sk = new URL(request.url).searchParams.get('sk')
    if (sk !== process.env.SECRET_KEY) {
      return new Response('Invalid secret key', { status: 403 })
    }
    const body: { identifier: string; hash: string } = await request.json()
    await ctx.runMutation(internal.init.updatePreviewInfoForClaim, body)
    await ctx.runMutation(internal.init.clearData)
    return new Response('success', {
      status: 200,
    })
  }),
})

http.route({
  path: '/seed',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const sk = new URL(request.url).searchParams.get('sk')
    if (sk !== process.env.SECRET_KEY) {
      return new Response('Invalid secret key', { status: 403 })
    }
    await ctx.runMutation(internal.init.addSeedData)
    return new Response('success', { status: 200 })
  }),
})

// Convex expects the router to be the default export of `convex/http.js`.
export default http
