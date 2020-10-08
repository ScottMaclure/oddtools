#!/usr/bin/bash
now=`date`
sed -i -E "s/\"version\": \"(.*)\"/\"version\": \"$now\"/g" ./src/data/app.json
echo "Bumped version to ${now}."