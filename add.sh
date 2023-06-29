#!/bin/bash

module_name=$1

if [ -z "$module_name" ]; then
  echo "Module name not provided."
  exit 1
fi

yarn add $module_name && yarn add -D @types/$module_name
