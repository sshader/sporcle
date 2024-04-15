import process from "process"


// Fetch the URL + admin key for the specified preview deployment, which allows running
// internal functions against the preview deployment.
// 
// This matches https://github.com/get-convex/convex-js/blob/87ffb23d1fd1a02a051992c58983ad10b517f0fb/src/cli/lib/api.ts#L369
// returning { url: string, adminKey: string }.
const response = await fetch("https://api.convex.dev/api/deployment/authorize_preview", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.CONVEX_PREVIEW_DEPLOY_KEY}` },
    body: JSON.stringify({
        previewName: process.env.GITHUB_HEAD_REF,
        projectSelection: {
            kind: "deploymentName",
            // Name of prod convex deployment
            deploymentName: "jittery-butterfly-707"
        }
    })
})
const body = await response.json()
const result = process.argv[2] === "url" ? `convex_url=${body.url}` : `convex_admin_key=${body.adminKey}`
process.stdout.write(result)