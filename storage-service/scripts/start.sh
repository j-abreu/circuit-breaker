#!/bin/sh
ENTRY_POINT=$1;

echo "Running linter...\n";
npm run lint;

echo "Running linter fixer\n";
npm run fix;

echo "Compiling Typescript...\n";
npm run compile;

echo "Starting server...\n";

node --env-file=.env $ENTRY_POINT;