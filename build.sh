#!/bin/bash

if [[ $VERCEL_ENV == "preview"  ]] ; then 
	export NEXT_PUBLIC_CONVEX_URL=$(npx convex preview $VERCEL_GIT_COMMIT_REF --run 'seed:default') && next build
elif [[ $VERCEL_ENV == "prod" ]]; then  
  npx convex deploy && next build
else
	echo "No dev command"
fi