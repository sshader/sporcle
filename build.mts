import { execSync } from 'node:child_process'

const main = async () => {
  console.info('Claiming instance')
  const claimInstanceArgs = {
    identifier: process.env.VERCEL_GIT_COMMIT_REF,
    hash: process.env.VERCEL_GIT_COMMIT_SHA,
  }
  console.log(process.env.CONVEX_DEPLOY_KEY)
  let output = execSync(
    `CONVEX_DEPLOYMENT='affable-caiman-602' CONVEX_DEPLOY_KEY='dev:affable-caiman-602|01bb59b062321ca08ae057ca39d5e4ec25fc51502381f247604f36ce76281f0e47fa667c72c4da3420a6d0ac7da8a9ae3f75' npx convex run claimInstance --no-push '${JSON.stringify(
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
