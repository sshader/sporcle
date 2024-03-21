

const response = await fetch("https://api.convex.dev/api/deployment/authorize_preview", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.CONVEX_PREVIEW_DEPLOY_KEY}` },
    body: JSON.stringify({
        previewName: process.env.GITHUB_HEAD_REF,
        projectSelection: {
            kind: "deploymentName",
            deploymentName: "jittery-butterfly-707"
        }
    })
})
const rawBody = await response.text()
console.log(rawBody)
console.log(process.env.CONVEX_PREVIEW_DEPLOY_KEY, process.env.GITHUB_HEAD_REF)
const body = JSON.parse(rawBody)
console.log(`convex_url=${body.url} convex_admin_key=${body.adminKey}`)
