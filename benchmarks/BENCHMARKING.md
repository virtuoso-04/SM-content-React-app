# Image Quality Benchmarking Guide

This directory contains tools to benchmark and compare image generation quality across different AI providers (Pollinations AI vs Gemini Imagen 3).

## Purpose

Demonstrate that Smart Content Studio's multi-model router provides superior results by:
- **CLIP Score**: Measuring how well generated images match text prompts
- **FID Score**: Evaluating image quality compared to real-world images (MS-COCO dataset)

## Installation

```bash
# From project root
cd benchmarks

# Install benchmarking dependencies
pip install -r benchmark_requirements.txt

# This will install:
# - OpenAI CLIP for semantic similarity
# - text2image-benchmark for standardized FID calculation
# - PyTorch and supporting libraries
```

**Note**: First run will download:
- CLIP model weights (~350MB)
- MS-COCO validation stats for FID (~1GB) - optional

## Quick Start

### Quick Benchmark (4 prompts, CLIP only, ~2 mins)
```bash
# From project root
python benchmarks/benchmark_image_quality.py --quick
```

### Full Benchmark (12 prompts, CLIP + FID, ~10 mins)
```bash
# From project root
python benchmarks/benchmark_image_quality.py
```

### Custom Options
```bash
# Test specific providers only
python benchmarks/benchmark_image_quality.py --providers pollinations gemini

# Skip FID calculation (faster)
python benchmarks/benchmark_image_quality.py --no-fid

# Test with backend on different URL
export BENCHMARK_API_URL=http://your-backend:8000
python benchmarks/benchmark_image_quality.py
```

## Understanding Results

### CLIP Score (Higher is Better)
- **Range**: 0.20 - 0.35 (typical for text-to-image models)
- **0.30+**: Excellent prompt adherence
- **0.25-0.30**: Good alignment
- **<0.25**: Poor prompt following

**What it measures**: How semantically similar the generated image is to the text prompt using OpenAI's CLIP vision-language model.

### FID Score (Lower is Better)
- **Range**: 10 - 50 (typical for modern generators)
- **<20**: High quality, photorealistic
- **20-30**: Good quality
- **>30**: Lower quality or stylized

**What it measures**: Fréchet Inception Distance - statistical similarity between generated images and real MS-COCO images.

## Output Structure

```
benchmark_results/
├── benchmark_results_20251201_143022.json  # Full metrics data
└── images/
    ├── pollinations/
    │   ├── image_001.png
    │   ├── image_002.png
    │   └── ...
    └── gemini/
        ├── image_001.png
        ├── image_002.png
        └── ...
```

## Example Results

```
Provider Comparison:
Provider        CLIP Score      FID Score       Success Rate
------------------------------------------------------------
POLLINATIONS    0.2847          24.3156         12/12
GEMINI          0.3012          18.7429         12/12
```

**Interpretation**: 
- Gemini shows **5.8% higher CLIP score** (better prompt alignment)
- Gemini shows **23% lower FID** (higher quality, more photorealistic)
- Both providers achieved 100% success rate

## Multi-Model Router Advantage

Rather than forcing users to a single provider, Smart Content Studio lets users **choose the optimal model** for their needs:

| Use Case | Best Provider | Why |
|----------|--------------|-----|
| Quick ideation, sketches | Pollinations | Fast, creative, no API limits |
| Marketing materials, portfolios | Gemini Imagen 3 | Higher quality, photorealistic detail |
| Rapid prototyping | Pollinations | Instant results for iteration |
| Final production assets | Gemini | Professional quality output |

**Key Benefit**: Users get the best of both worlds - speed when needed, quality when it matters.

## Troubleshooting

### "T2IBenchmark not installed"
```bash
pip install git+https://github.com/openai/CLIP.git
pip install git+https://github.com/boomb0om/text2image-benchmark
```

### "Backend API error"
Ensure your FastAPI backend is running:
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### "CUDA out of memory"
```bash
# Use CPU instead (slower but works)
export CUDA_VISIBLE_DEVICES=""
python benchmarks/benchmark_image_quality.py --quick
```

### FID calculation fails
Skip FID and use CLIP-only comparison:
```bash
python benchmarks/benchmark_image_quality.py --no-fid
```

## Adding to Your README/Docs

Include these benchmark results in your project documentation to demonstrate:
1. **Technical credibility** - Quantified quality metrics
2. **Multi-model value** - Each provider excels in different scenarios
3. **User empowerment** - Choice drives better outcomes than one-size-fits-all

## Citation

If publishing these results, cite the benchmark tool:

```bibtex
@misc{boomb0omT2IBenchmark,
  author={Pavlov, I. and Ivanov, A. and Stafievskiy, S.},
  title={{Text-to-Image Benchmark: A benchmark for generative models}},
  howpublished={\url{https://github.com/boomb0om/text2image-benchmark}},
  year={2023}
}
```

## Next Steps

1. Run the benchmark: `python benchmarks/benchmark_image_quality.py --quick`
2. Review results in `benchmarks/benchmark_results/`
3. Add findings to your project README
4. Share comparative images in your portfolio/demo

The quantified metrics prove that your multi-model architecture delivers measurable quality advantages!
