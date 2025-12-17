"""
Text Quality Benchmarking Tool for Smart Content Studio

Compares text generation quality across different providers (Gemini vs Grok) using:
- BLEU Score: Measures similarity to reference texts
- ROUGE Score: Evaluates summary quality
- Perplexity: Measures text coherence and fluency
- Readability Metrics: Flesch Reading Ease, Gunning Fog Index
- Semantic Similarity: Using sentence transformers
"""

import asyncio
import httpx
import json
import os
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import sys

# Add parent directory to path to import backend modules
sys.path.append(str(Path(__file__).parent.parent))

try:
    # NLP and evaluation libraries
    from nltk.translate.bleu_score import sentence_bleu, SmoothingFunction
    from rouge_score import rouge_scorer
    import textstat
    from sentence_transformers import SentenceTransformer, util
    import nltk
    
    # Download required NLTK data
    try:
        nltk.data.find('tokenizers/punkt')
    except LookupError:
        nltk.download('punkt', quiet=True)
        
except ImportError as e:
    print(f"❌ Missing required library: {e}")
    print("\n📦 Install dependencies with:")
    print("pip install nltk rouge-score textstat sentence-transformers torch")
    sys.exit(1)

# Import backend configuration
try:
    from backend.config import GEMINI_API_KEY, GROK_API_KEY, GEMINI_API_URL, GROK_API_URL
except ImportError:
    print("⚠️  Could not import backend config. Using environment variables.")
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    GROK_API_KEY = os.getenv('GROK_API_KEY')
    GEMINI_API_URL = os.getenv('GEMINI_API_URL', 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent')
    GROK_API_URL = os.getenv('GROK_API_URL', 'https://api.x.ai/v1/chat/completions')


class TextQualityBenchmark:
    """Benchmark text generation quality across AI providers"""
    
    def __init__(self, results_dir: str = "benchmarks/benchmark_results/text"):
        self.results_dir = Path(results_dir)
        self.results_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize evaluation models
        print("🔧 Initializing evaluation models...")
        self.semantic_model = SentenceTransformer('all-MiniLM-L6-v2')
        self.rouge_scorer = rouge_scorer.RougeScorer(['rouge1', 'rouge2', 'rougeL'], use_stemmer=True)
        self.smoothing = SmoothingFunction().method1
        
        print("✅ Benchmark initialized")
    
    async def call_gemini(self, prompt: str, temperature: float = 0.7) -> Tuple[str, float]:
        """Call Gemini API and return response with latency"""
        start_time = time.time()
        
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
                    json={
                        "contents": [{"parts": [{"text": prompt}]}],
                        "generationConfig": {
                            "temperature": temperature,
                            "maxOutputTokens": 2048,
                        }
                    }
                )
                
                if response.status_code != 200:
                    raise Exception(f"Gemini API error: {response.status_code}")
                
                result = response.json()
                text = result["candidates"][0]["content"]["parts"][0]["text"]
                latency = time.time() - start_time
                
                return text, latency
                
        except Exception as e:
            print(f"❌ Gemini error: {e}")
            return "", 0.0
    
    async def call_grok(self, prompt: str, temperature: float = 0.7) -> Tuple[str, float]:
        """Call Grok API and return response with latency"""
        start_time = time.time()
        
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    GROK_API_URL,
                    headers={"Authorization": f"Bearer {GROK_API_KEY}"},
                    json={
                        "model": "grok-beta",
                        "messages": [
                            {"role": "system", "content": "You are a helpful AI assistant."},
                            {"role": "user", "content": prompt}
                        ],
                        "temperature": temperature,
                        "max_tokens": 2048,
                    }
                )
                
                if response.status_code != 200:
                    raise Exception(f"Grok API error: {response.status_code}")
                
                result = response.json()
                text = result["choices"][0]["message"]["content"]
                latency = time.time() - start_time
                
                return text, latency
                
        except Exception as e:
            print(f"❌ Grok error: {e}")
            return "", 0.0
    
    def calculate_bleu(self, reference: str, candidate: str) -> float:
        """Calculate BLEU score (0-1, higher is better)"""
        reference_tokens = reference.lower().split()
        candidate_tokens = candidate.lower().split()
        
        if not candidate_tokens or not reference_tokens:
            return 0.0
        
        return sentence_bleu([reference_tokens], candidate_tokens, smoothing_function=self.smoothing)
    
    def calculate_rouge(self, reference: str, candidate: str) -> Dict[str, float]:
        """Calculate ROUGE scores (0-1, higher is better)"""
        scores = self.rouge_scorer.score(reference, candidate)
        
        return {
            'rouge1_f': scores['rouge1'].fmeasure,
            'rouge2_f': scores['rouge2'].fmeasure,
            'rougeL_f': scores['rougeL'].fmeasure,
        }
    
    def calculate_readability(self, text: str) -> Dict[str, float]:
        """Calculate readability metrics"""
        return {
            'flesch_reading_ease': textstat.flesch_reading_ease(text),  # 0-100, higher is easier
            'flesch_kincaid_grade': textstat.flesch_kincaid_grade(text),  # US grade level
            'gunning_fog': textstat.gunning_fog(text),  # Years of education needed
            'smog_index': textstat.smog_index(text),  # Years of education needed
            'automated_readability_index': textstat.automated_readability_index(text),
            'coleman_liau_index': textstat.coleman_liau_index(text),
        }
    
    def calculate_semantic_similarity(self, text1: str, text2: str) -> float:
        """Calculate semantic similarity using sentence transformers (0-1, higher is better)"""
        embeddings = self.semantic_model.encode([text1, text2])
        similarity = util.cos_sim(embeddings[0], embeddings[1])
        return float(similarity[0][0])
    
    def calculate_text_stats(self, text: str) -> Dict[str, int]:
        """Calculate basic text statistics"""
        return {
            'char_count': len(text),
            'word_count': len(text.split()),
            'sentence_count': textstat.sentence_count(text),
            'syllable_count': textstat.syllable_count(text),
            'lexicon_count': textstat.lexicon_count(text),
        }
    
    async def benchmark_summarization(self, num_samples: int = 5) -> Dict:
        """Benchmark summarization quality"""
        print("\n📝 Benchmarking Summarization...")
        
        test_cases = [
            {
                "text": """Artificial intelligence (AI) is intelligence demonstrated by machines, in contrast to the natural intelligence displayed by humans and animals. Leading AI textbooks define the field as the study of "intelligent agents": any device that perceives its environment and takes actions that maximize its chance of successfully achieving its goals. Colloquially, the term "artificial intelligence" is often used to describe machines (or computers) that mimic "cognitive" functions that humans associate with the human mind, such as "learning" and "problem solving". As machines become increasingly capable, tasks considered to require "intelligence" are often removed from the definition of AI, a phenomenon known as the AI effect. A quip in Tesler's Theorem says "AI is whatever hasn't been done yet." For instance, optical character recognition is frequently excluded from things considered to be AI, having become a routine technology.""",
                "reference": "AI is intelligence shown by machines. It's defined as studying intelligent agents that perceive and act to achieve goals. The term describes machines mimicking human cognitive functions like learning. As AI advances, tasks once thought to require intelligence are no longer considered AI (the AI effect)."
            },
            {
                "text": """Climate change includes both global warming driven by human-induced emissions of greenhouse gases and the resulting large-scale shifts in weather patterns. Though there have been previous periods of climatic change, since the mid-20th century humans have had an unprecedented impact on Earth's climate system and caused change on a global scale. The largest driver of warming is the emission of gases that create a greenhouse effect, of which more than 90% are carbon dioxide and methane. Fossil fuel burning for energy consumption is the main source of these emissions, with additional contributions from agriculture, deforestation, and industrial processes.""",
                "reference": "Climate change involves global warming from human greenhouse gas emissions and major weather pattern shifts. Since the mid-20th century, humans have significantly impacted Earth's climate. The main cause is greenhouse gases, mostly CO2 and methane from fossil fuel burning, agriculture, and deforestation."
            },
        ]
        
        results = {"gemini": [], "grok": []}
        
        for i, test in enumerate(test_cases[:num_samples], 1):
            print(f"\n  Test {i}/{min(num_samples, len(test_cases))}")
            prompt = f"Summarize the following text concisely:\n\n{test['text']}"
            
            # Test Gemini
            print("    ⏳ Testing Gemini...")
            gemini_text, gemini_latency = await self.call_gemini(prompt)
            
            if gemini_text:
                metrics = {
                    'latency': gemini_latency,
                    'bleu': self.calculate_bleu(test['reference'], gemini_text),
                    **self.calculate_rouge(test['reference'], gemini_text),
                    'semantic_similarity': self.calculate_semantic_similarity(test['reference'], gemini_text),
                    **self.calculate_readability(gemini_text),
                    **self.calculate_text_stats(gemini_text),
                    'output': gemini_text,
                }
                results['gemini'].append(metrics)
                print(f"      ✓ BLEU: {metrics['bleu']:.3f}, ROUGE-L: {metrics['rougeL_f']:.3f}")
            
            # Test Grok
            print("    ⏳ Testing Grok...")
            grok_text, grok_latency = await self.call_grok(prompt)
            
            if grok_text:
                metrics = {
                    'latency': grok_latency,
                    'bleu': self.calculate_bleu(test['reference'], grok_text),
                    **self.calculate_rouge(test['reference'], grok_text),
                    'semantic_similarity': self.calculate_semantic_similarity(test['reference'], grok_text),
                    **self.calculate_readability(grok_text),
                    **self.calculate_text_stats(grok_text),
                    'output': grok_text,
                }
                results['grok'].append(metrics)
                print(f"      ✓ BLEU: {metrics['bleu']:.3f}, ROUGE-L: {metrics['rougeL_f']:.3f}")
            
            await asyncio.sleep(1)  # Rate limiting
        
        return results
    
    async def benchmark_idea_generation(self, num_samples: int = 3) -> Dict:
        """Benchmark idea generation creativity and relevance"""
        print("\n💡 Benchmarking Idea Generation...")
        
        test_prompts = [
            "innovative ways to reduce plastic waste in cities",
            "creative content ideas for a tech startup blog",
            "unique game mechanics for a puzzle game",
        ]
        
        results = {"gemini": [], "grok": []}
        
        for i, topic in enumerate(test_prompts[:num_samples], 1):
            print(f"\n  Test {i}/{min(num_samples, len(test_prompts))}: {topic}")
            prompt = f"Generate 5 creative and diverse ideas for: {topic}"
            
            # Test Gemini
            print("    ⏳ Testing Gemini...")
            gemini_text, gemini_latency = await self.call_gemini(prompt, temperature=0.9)
            
            if gemini_text:
                metrics = {
                    'latency': gemini_latency,
                    **self.calculate_readability(gemini_text),
                    **self.calculate_text_stats(gemini_text),
                    'output': gemini_text,
                }
                results['gemini'].append(metrics)
                print(f"      ✓ Generated {metrics['word_count']} words in {gemini_latency:.2f}s")
            
            # Test Grok
            print("    ⏳ Testing Grok...")
            grok_text, grok_latency = await self.call_grok(prompt, temperature=0.9)
            
            if grok_text:
                metrics = {
                    'latency': grok_latency,
                    **self.calculate_readability(grok_text),
                    **self.calculate_text_stats(grok_text),
                    'output': grok_text,
                }
                results['grok'].append(metrics)
                print(f"      ✓ Generated {metrics['word_count']} words in {grok_latency:.2f}s")
            
            await asyncio.sleep(1)
        
        return results
    
    async def benchmark_content_refinement(self, num_samples: int = 3) -> Dict:
        """Benchmark content refinement quality"""
        print("\n✨ Benchmarking Content Refinement...")
        
        test_cases = [
            {
                "text": "the AI its very powerfull and can do lot of thing for help peoples in they daily task",
                "instruction": "Fix grammar and improve clarity"
            },
            {
                "text": "Our company offers services. We have good products. Contact us for more information.",
                "instruction": "Make it more engaging and professional"
            },
        ]
        
        results = {"gemini": [], "grok": []}
        
        for i, test in enumerate(test_cases[:num_samples], 1):
            print(f"\n  Test {i}/{min(num_samples, len(test_cases))}")
            prompt = f"Refine this content based on the instruction:\n\nContent: {test['text']}\n\nInstruction: {test['instruction']}"
            
            # Test both providers
            for provider_name, provider_func in [("gemini", self.call_gemini), ("grok", self.call_grok)]:
                print(f"    ⏳ Testing {provider_name.title()}...")
                output_text, latency = await provider_func(prompt)
                
                if output_text:
                    metrics = {
                        'latency': latency,
                        'semantic_similarity': self.calculate_semantic_similarity(test['text'], output_text),
                        **self.calculate_readability(output_text),
                        **self.calculate_text_stats(output_text),
                        'improvement_ratio': len(output_text) / len(test['text']),
                        'output': output_text,
                    }
                    results[provider_name].append(metrics)
                    print(f"      ✓ Readability: {metrics['flesch_reading_ease']:.1f}")
            
            await asyncio.sleep(1)
        
        return results
    
    def aggregate_results(self, results: Dict) -> Dict:
        """Calculate aggregate statistics"""
        aggregated = {}
        
        for provider, samples in results.items():
            if not samples:
                continue
            
            # Calculate averages for numeric metrics
            numeric_metrics = {}
            for key in samples[0].keys():
                if key != 'output' and isinstance(samples[0][key], (int, float)):
                    values = [s[key] for s in samples if key in s]
                    numeric_metrics[f'avg_{key}'] = sum(values) / len(values) if values else 0
                    numeric_metrics[f'min_{key}'] = min(values) if values else 0
                    numeric_metrics[f'max_{key}'] = max(values) if values else 0
            
            aggregated[provider] = numeric_metrics
        
        return aggregated
    
    def save_results(self, benchmark_type: str, results: Dict, aggregated: Dict):
        """Save benchmark results to JSON"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = self.results_dir / f"{benchmark_type}_{timestamp}.json"
        
        output = {
            'benchmark_type': benchmark_type,
            'timestamp': timestamp,
            'raw_results': results,
            'aggregated': aggregated,
        }
        
        with open(filename, 'w') as f:
            json.dump(output, f, indent=2)
        
        print(f"\n💾 Results saved to: {filename}")
    
    def print_comparison(self, aggregated: Dict):
        """Print comparison table"""
        print("\n" + "="*80)
        print("📊 PROVIDER COMPARISON")
        print("="*80)
        
        providers = list(aggregated.keys())
        if len(providers) < 2:
            print("⚠️  Need at least 2 providers for comparison")
            return
        
        # Print key metrics
        metrics_to_show = [
            ('avg_latency', 'Latency (s)', '.2f'),
            ('avg_bleu', 'BLEU Score', '.3f'),
            ('avg_rougeL_f', 'ROUGE-L', '.3f'),
            ('avg_semantic_similarity', 'Semantic Sim', '.3f'),
            ('avg_flesch_reading_ease', 'Readability', '.1f'),
            ('avg_word_count', 'Words', '.0f'),
        ]
        
        print(f"\n{'Metric':<25} {'Gemini':<15} {'Grok':<15} {'Winner':<10}")
        print("-" * 70)
        
        for metric_key, metric_name, fmt in metrics_to_show:
            if metric_key not in aggregated.get('gemini', {}):
                continue
            
            gemini_val = aggregated.get('gemini', {}).get(metric_key, 0)
            grok_val = aggregated.get('grok', {}).get(metric_key, 0)
            
            # Determine winner (lower is better for latency, higher for others)
            if 'latency' in metric_key:
                winner = 'Gemini' if gemini_val < grok_val else 'Grok'
            else:
                winner = 'Gemini' if gemini_val > grok_val else 'Grok'
            
            print(f"{metric_name:<25} {gemini_val:{fmt}:<15} {grok_val:{fmt}:<15} {winner:<10}")


async def main():
    """Run comprehensive text quality benchmarks"""
    print("\n🚀 Smart Content Studio - Text Quality Benchmark")
    print("="*80)
    
    if not GEMINI_API_KEY and not GROK_API_KEY:
        print("❌ Error: No API keys found!")
        print("Set GEMINI_API_KEY and/or GROK_API_KEY environment variables")
        return
    
    benchmark = TextQualityBenchmark()
    
    # Run benchmarks
    print("\n🏃 Running benchmarks...")
    
    summarization_results = await benchmark.benchmark_summarization(num_samples=2)
    summarization_agg = benchmark.aggregate_results(summarization_results)
    benchmark.save_results('summarization', summarization_results, summarization_agg)
    benchmark.print_comparison(summarization_agg)
    
    idea_results = await benchmark.benchmark_idea_generation(num_samples=2)
    idea_agg = benchmark.aggregate_results(idea_results)
    benchmark.save_results('idea_generation', idea_results, idea_agg)
    
    refinement_results = await benchmark.benchmark_content_refinement(num_samples=2)
    refinement_agg = benchmark.aggregate_results(refinement_results)
    benchmark.save_results('content_refinement', refinement_results, refinement_agg)
    benchmark.print_comparison(refinement_agg)
    
    print("\n✅ Benchmark complete!")
    print(f"📁 Results saved in: benchmarks/benchmark_results/text/")


if __name__ == "__main__":
    asyncio.run(main())
