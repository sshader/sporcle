import { execSync } from 'node:child_process'

const main = async () => {
  console.info('Claiming instance')
  const claimInstanceArgs = {
    identifier: process.env.VERCEL_GIT_COMMIT_REF,
    hash: process.env.VERCEL_GIT_COMMIT_SHA,
  }
  let output = execSync(
    `npx convex run claimInstance --no-push '${JSON.stringify(
      claimInstanceArgs
    )}'`,
    {
      encoding: 'utf-8',
    }
  )

  const claimedInstanceInfo: { instanceName: string; deploymentKey: string } =
    JSON.parse(output)

  execSync(
    `CONVEX_DEPLOYMENT='${
      claimedInstanceInfo.instanceName
    }' CONVEX_DEPLOY_KEY='${
      claimedInstanceInfo.deploymentKey
    }' npx convex run updatePreviewInfoForClaim --no-push '${JSON.stringify(
      claimInstanceArgs
    )}'`,
    {
      encoding: 'utf-8',
    }
  )

  execSync(
    `CONVEX_DEPLOYMENT='${claimedInstanceInfo.instanceName}' CONVEX_DEPLOY_KEY='${claimedInstanceInfo.deploymentKey}' npx convex run clearData --no-push '{}'`,
    {
      encoding: 'utf-8',
    }
  )

  execSync(
    `CONVEX_DEPLOYMENT='${claimedInstanceInfo.instanceName}' CONVEX_DEPLOY_KEY='${claimedInstanceInfo.deploymentKey}' npx convex deploy`,
    {
      encoding: 'utf-8',
    }
  )

  execSync(
    `CONVEX_DEPLOYMENT='${claimedInstanceInfo.instanceName}' CONVEX_DEPLOY_KEY='${claimedInstanceInfo.deploymentKey}' npx convex run addSeedData --no-push`,
    {
      encoding: 'utf-8',
    }
  )

  execSync(
    `NEXT_PUBLIC_CONVEX_URL='https://${claimedInstanceInfo.instanceName}.convex.cloud' NEXT_PUBLIC_DEPLOYMENT_IDENTIFIER='${process.env.VERCEL_GIT_COMMIT_REF} NEXT_PUBLIC_DEPLOYMENT_HASH='${process.env.VERCEL_GIT_COMMIT_SHA}' next build`,
    {
      encoding: 'utf-8',
    }
  )
}

main()
