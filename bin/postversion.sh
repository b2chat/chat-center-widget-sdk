#!/usr/bin/env bash
set -exuo pipefail

yarn build

git add package.json

git commit -n -m "Bump version to v$npm_package_version"

git tag -a v$npm_package_version -m "$npm_package_version"
