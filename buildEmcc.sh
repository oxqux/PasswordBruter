#!/bin/bash

set -e

mkdir -p public
cd public

emcc ../bruteforce.cpp -O3 -o bruteforce.js \
  -s WASM=1 \
  -s MODULARIZE=1 \
  -s EXPORT_ES6=1 \
  -s EXPORT_NAME=BruteForceModule \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s EXPORTED_FUNCTIONS='["_wasm_md5","_wasm_get_out","_wasm_get_last","_alphabet_init","_alphabet_batch","_dict_init","_dict_add_password","_dict_batch","_dict_total","_dict_checked"]' \
  -s EXPORTED_RUNTIME_METHODS='["ccall"]'

cd ..

echo "Build completed successfully."
