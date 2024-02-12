#!/bin/sh
/home/user/gpt-threads/gpt-threads-compute/llama.cpp/build/bin/llamacppmain \
    -m "/home/user/gpt-threads/gpt-threads-compute/llama.cpp/models/mixtral-8x7b-instruct-v0.1.Q5_0.gguf" \
    -p "[INST]$1[\INST]" \
    --repeat_penalty 1 \
    --no-penalize-nl \
    --n-predict 1000 --color --temp 0.7 -t 3 -c 512 -n -1

# --prompt-cache FNAME file to cache prompt state for faster startup (default: none)

# --prompt-cache-all if specified, saves user input and generations to cache as well. not supported with --interactive or other interactive options

# --prompt-cache-ro if specified, uses the prompt cache but does not update it.

# -   `-mg i, --main-gpu i`: When using multiple GPUs this option controls which GPU is used for small tensors for which the overhead of splitting the computation across all GPUs is not worthwhile. The GPU in question will use slightly more VRAM to store a scratch buffer for temporary results. By default GPU 0 is used. Requires cuBLAS.
# -   `-ts SPLIT, --tensor-split SPLIT`: When using multiple GPUs this option controls how large tensors should be split across all GPUs. `SPLIT` is a comma-separated list of non-negative values that assigns the proportion of data that each GPU should get in order. For example, "3,2" will assign 60% of the data to GPU 0 and 40% to GPU 1. By default the data is split in proportion to VRAM but this may not be optimal for performance. Requires cuBLAS.
