#!/bin/bash

if [ $CONTEXT = "deploy-preview"  ] ; then 
	export NEXT_PUBLIC_CONVEX_URL=$(npx convex preview $HEAD --run 'seed:default') && next build
elif [ $CONTEXT = "production" ]; then  
  npx convex deploy && next build
else
	echo "No dev command"
fi