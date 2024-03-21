

const response = fetch("", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
