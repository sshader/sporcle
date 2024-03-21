

const response = await fetch("https://api.convex.dev/api/deployments/authorize_preview", {
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
const body = await response.json()
console.log(`convex_url=${body.url} convex_admin_key=${body.adminKey}`)