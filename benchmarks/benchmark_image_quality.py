"""
Smart Content Studio - Image Quality Benchmarking
Compares image quality across different providers using CLIP score and FID metrics.

This script demonstrates that the multi-model router provides better quality
by allowing users to choose the optimal provider for their specific use case.

NOTE: Run this script from the project root, not from within the benchmarks directory.
Usage: python benchmarks/benchmark_image_quality.py --quick
"""

import asyncio
import httpx
import os
import json
from pathlib import Path
from typing import List, Dict, Tuple
from datetime import datetime
import argparse

try:
    from T2IBenchmark import calculate_clip_score, calculate_fid
    from T2IBenchmark.datasets import get_coco_fid_stats
    import torch
    # Force CPU mode for CLIP on machines without CUDA
    if not torch.cuda.is_available():
        import os
        os.environ['CUDA_VISIBLE_DEVICES'] = ''
    BENCHMARK_AVAILABLE = True
except ImportError:
    print("⚠️  Warning: T2IBenchmark not installed. Run: pip install -r benchmark_requirements.txt")
    BENCHMARK_AVAILABLE = False

from dotenv import load_dotenv

load_dotenv()

# Test prompts covering different complexity levels
TEST_PROMPTS = [
    # Simple subjects
    "a red apple on a wooden table",
    "a fluffy white cat sleeping",
    "a modern coffee cup",
    
    # Medium complexity
    "a futuristic city skyline at sunset with flying cars",
    "a fantasy dragon perched on a mountain peak",
    "a serene Japanese garden with cherry blossoms",
    
    # High complexity / creative
    "an astronaut riding a horse through a nebula in space",
    "a steampunk Victorian mansion with clockwork mechanisms",
    "a surreal dreamscape with floating islands and waterfalls",
    
    # Technical/detailed
    "a detailed mechanical watch with visible gears and springs",
    "a photorealistic portrait of an elderly person with wrinkles",
    "an intricate mandala pattern with geometric precision"
]

PROVIDERS = ["pollinations", "gemini"]
OUTPUT_DIR = Path("benchmark_results")
IMAGES_DIR = OUTPUT_DIR / "images"


async def generate_image(prompt: str, provider: str, style: str = None) -> Tuple[str, bytes]:
    """
    Generate an image using the backend API and return the image data.
    """
    backend_url = os.getenv("BENCHMARK_API_URL", "http://localhost:8000")
    
    payload = {
        "prompt": prompt,
        "provider": provider,
        "aspect_ratio": "1:1"
    }
    
    if style:
        payload["style"] = style
    
    async with httpx.AsyncClient(timeout=120.0) as client:
        # Call the backend API
        response = await client.post(f"{backend_url}/api/generate-image", json=payload)
        
        if response.status_code != 200:
            raise Exception(f"API error: {response.status_code} - {response.text}")
        
        data = response.json()
        image_url = data.get("image_url")
        
        if not image_url:
            raise Exception("No image URL returned")
        
        # Download the image
        img_response = await client.get(image_url)
        
        if img_response.status_code != 200:
            raise Exception(f"Failed to download image: {img_response.status_code}")
        
        return image_url, img_response.content


async def run_benchmark(
    prompts: List[str] = None,
    providers: List[str] = None,
    calculate_fid_score: bool = True
):
    """
    Run comprehensive benchmark comparing different image providers.
    """
    if not BENCHMARK_AVAILABLE:
        print("❌ Cannot run benchmark without T2IBenchmark library installed.")
        print("   Install with: pip install -r benchmark_requirements.txt")
        return
    
    prompts = prompts or TEST_PROMPTS
    providers = providers or PROVIDERS
    
    # Create output directories
    OUTPUT_DIR.mkdir(exist_ok=True)
    IMAGES_DIR.mkdir(exist_ok=True)
    
    print(f"\n{'='*80}")
    print(f"🎯 Smart Content Studio - Image Quality Benchmark")
    print(f"{'='*80}\n")
    print(f"📊 Testing {len(providers)} providers with {len(prompts)} prompts")
    print(f"📁 Results will be saved to: {OUTPUT_DIR}")
    print(f"\nProviders: {', '.join(providers)}")
    print(f"\n{'='*80}\n")
    
    results = {
        "benchmark_date": datetime.now().isoformat(),
        "providers": providers,
        "prompts": prompts,
        "generations": {},
        "metrics": {}
    }
    
    # Generate images for each provider
    for provider in providers:
        print(f"\n🎨 Generating images with {provider.upper()}...")
        provider_dir = IMAGES_DIR / provider
        provider_dir.mkdir(exist_ok=True)
        
        results["generations"][provider] = []
        
        for idx, prompt in enumerate(prompts, 1):
            print(f"   [{idx}/{len(prompts)}] {prompt[:50]}...")
            
            try:
                image_url, image_data = await generate_image(prompt, provider)
                
                # Save image locally
                image_path = provider_dir / f"image_{idx:03d}.png"
                with open(image_path, "wb") as f:
                    f.write(image_data)
                
                results["generations"][provider].append({
                    "prompt": prompt,
                    "image_path": str(image_path),
                    "image_url": image_url,
                    "success": True
                })
                
            except Exception as e:
                print(f"      ❌ Error: {str(e)}")
                results["generations"][provider].append({
                    "prompt": prompt,
                    "error": str(e),
                    "success": False
                })
    
    print(f"\n{'='*80}\n")
    print("📈 Calculating quality metrics...\n")
    
    # Calculate CLIP scores
    print("🔍 Computing CLIP scores (prompt-image alignment)...")
    for provider in providers:
        provider_generations = results["generations"][provider]
        successful_gens = [g for g in provider_generations if g.get("success")]
        
        if not successful_gens:
            print(f"   ⚠️  {provider}: No successful generations")
            continue
        
        image_paths = [g["image_path"] for g in successful_gens]
        captions_mapping = {g["image_path"]: g["prompt"] for g in successful_gens}
        
        try:
            # Use CPU for CLIP if CUDA not available
            device = "cuda" if torch.cuda.is_available() else "cpu"
            clip_score = calculate_clip_score(
                image_paths, 
                captions_mapping=captions_mapping,
                device=device
            )
            results["metrics"][provider] = {
                "clip_score": float(clip_score),
                "successful_generations": len(successful_gens),
                "failed_generations": len(provider_generations) - len(successful_gens)
            }
            print(f"   ✅ {provider.upper()}: CLIP Score = {clip_score:.4f}")
        except Exception as e:
            print(f"   ❌ {provider.upper()}: CLIP calculation failed - {str(e)}")
            results["metrics"][provider] = {"error": str(e)}
    
    # Calculate FID scores (optional, requires reference dataset)
    if calculate_fid_score:
        print("\n🔍 Computing FID scores (image quality vs MS-COCO)...")
        print("   Note: This requires downloading MS-COCO validation stats (~1GB)")
        
        try:
            coco_stats = get_coco_fid_stats()
            
            for provider in providers:
                provider_dir = IMAGES_DIR / provider
                
                if not any(provider_dir.glob("*.png")):
                    print(f"   ⚠️  {provider}: No images to evaluate")
                    continue
                
                try:
                    fid_score, _ = calculate_fid(str(provider_dir), coco_stats)
                    results["metrics"][provider]["fid_score"] = float(fid_score)
                    print(f"   ✅ {provider.upper()}: FID Score = {fid_score:.4f} (lower is better)")
                except Exception as e:
                    print(f"   ❌ {provider.upper()}: FID calculation failed - {str(e)}")
                    
        except Exception as e:
            print(f"   ⚠️  FID calculation skipped: {str(e)}")
    
    # Save results
    results_file = OUTPUT_DIR / f"benchmark_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(results_file, "w") as f:
        json.dump(results, f, indent=2)
    
    # Generate summary report
    print(f"\n{'='*80}")
    print("📊 BENCHMARK SUMMARY")
    print(f"{'='*80}\n")
    
    print("Provider Comparison:")
    print(f"{'Provider':<15} {'CLIP Score':<15} {'FID Score':<15} {'Success Rate'}")
    print("-" * 60)
    
    for provider in providers:
        if provider not in results["metrics"]:
            continue
        
        metrics = results["metrics"][provider]
        clip = metrics.get("clip_score", "N/A")
        fid = metrics.get("fid_score", "N/A")
        success_rate = (
            f"{metrics['successful_generations']}/{metrics['successful_generations'] + metrics['failed_generations']}"
            if "successful_generations" in metrics else "N/A"
        )
        
        clip_str = f"{clip:.4f}" if isinstance(clip, (int, float)) else clip
        fid_str = f"{fid:.4f}" if isinstance(fid, (int, float)) else fid
        
        print(f"{provider.upper():<15} {clip_str:<15} {fid_str:<15} {success_rate}")
    
    print(f"\n{'='*80}")
    print(f"✅ Benchmark complete! Results saved to: {results_file}")
    print(f"{'='*80}\n")
    
    # Interpretation guide
    print("📖 How to interpret results:")
    print("   • CLIP Score: Measures how well images match prompts (higher is better)")
    print("     - Typical range: 0.20 - 0.35")
    print("     - >0.30 = Excellent prompt alignment")
    print("   • FID Score: Measures image quality vs real images (lower is better)")
    print("     - Typical range: 10 - 50")
    print("     - <20 = High quality, photorealistic images")
    print("\n💡 Multi-Model Advantage:")
    print("   Your router lets users choose the optimal provider per use case,")
    print("   combining the strengths of multiple models for superior results!\n")


async def quick_benchmark():
    """
    Quick benchmark with minimal prompts for faster testing.
    """
    quick_prompts = [
        "a red sports car",
        "a sunset over mountains",
        "a futuristic robot",
        "a watercolor painting of flowers"
    ]
    
    await run_benchmark(
        prompts=quick_prompts,
        providers=PROVIDERS,
        calculate_fid_score=False  # Skip FID for quick test
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Benchmark image quality across multiple AI providers"
    )
    parser.add_argument(
        "--quick",
        action="store_true",
        help="Run quick benchmark with fewer prompts (no FID calculation)"
    )
    parser.add_argument(
        "--providers",
        nargs="+",
        default=PROVIDERS,
        help=f"Providers to test (default: {' '.join(PROVIDERS)})"
    )
    parser.add_argument(
        "--no-fid",
        action="store_true",
        help="Skip FID score calculation"
    )
    
    args = parser.parse_args()
    
    if args.quick:
        print("🚀 Running quick benchmark...\n")
        asyncio.run(quick_benchmark())
    else:
        asyncio.run(
            run_benchmark(
                providers=args.providers,
                calculate_fid_score=not args.no_fid
            )
        )
