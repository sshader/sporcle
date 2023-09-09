import { execSync } from 'node:child_process'

const main = async () => {
  console.info('Claiming instance')
  const claimInstanceArgs = {
    identifier: process.env.VERCEL_GIT_COMMIT_REF,
    hash: process.env.VERCEL_GIT_COMMIT_SHA,
  }
  const claimUrl = new URL(
    `https://${process.env.COORDINATOR_CONVEX_URL}.convex.site/claimInstance`
  )
  claimUrl.searchParams.append('sk', process.env.COORDINATOR_SECRET_KEY!)
  const claimResponse = await fetch(claimUrl, {
    method: 'POST',
    body: JSON.stringify(claimInstanceArgs),
    headers: { 'content-type': 'application/json' },
  })
  if (!claimResponse.ok) {
    throw new Error(`Failed to claim instance: ${await claimResponse.text()}`)
  }

  const claimedInstanceInfo: { instanceName: string; deploymentKey: string } =
    await claimResponse.json()

  const setupUrl = new URL(
    `https://${claimedInstanceInfo.instanceName}.convex.site/setup`
  )
  setupUrl.searchParams.append('sk', claimedInstanceInfo.deploymentKey)
  const setupResponse = await fetch(setupUrl, {
    method: 'POST',
    body: JSON.stringify(claimInstanceArgs),
    headers: { 'content-type': 'application/json' },
  })
  if (!setupResponse.ok) {
    throw new Error(`Failed to set up instance: ${await setupResponse.text()}`)
  }

  execSync(
    `CONVEX_DEPLOYMENT='${claimedInstanceInfo.instanceName}' CONVEX_DEPLOY_KEY='${claimedInstanceInfo.deploymentKey}' npx convex deploy`,
    {
      encoding: 'utf-8',
    }
  )

  const seedUrl = new URL(
    `https://${claimedInstanceInfo.instanceName}.convex.site/setup`
  )
  seedUrl.searchParams.append('sk', claimedInstanceInfo.deploymentKey)
  const seedResponse = await fetch(seedUrl, {
    method: 'POST',
  })
  if (!seedResponse.ok) {
    throw new Error(`Failed to set up instance: ${await seedResponse.text()}`)
  }

  execSync(
    `NEXT_PUBLIC_CONVEX_URL='https://${claimedInstanceInfo.instanceName}.convex.cloud' NEXT_PUBLIC_DEPLOYMENT_IDENTIFIER='${process.env.VERCEL_GIT_COMMIT_REF} NEXT_PUBLIC_DEPLOYMENT_HASH='${process.env.VERCEL_GIT_COMMIT_SHA}' next build`,
    {
      encoding: 'utf-8',
    }
  )
}

main()
