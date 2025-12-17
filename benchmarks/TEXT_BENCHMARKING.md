# Text Quality Benchmarking Guide

This directory contains tools to benchmark and compare text generation quality across different AI providers (Gemini vs Grok).

## 📊 Metrics Evaluated

### 1. **BLEU Score** (0-1, higher is better)
- Measures similarity to reference texts
- Evaluates n-gram overlap between generated and reference text
- Used for summarization quality assessment

### 2. **ROUGE Scores** (0-1, higher is better)
- **ROUGE-1**: Unigram overlap (individual words)
- **ROUGE-2**: Bigram overlap (word pairs)
- **ROUGE-L**: Longest common subsequence
- Particularly useful for summarization evaluation

### 3. **Semantic Similarity** (0-1, higher is better)
- Uses sentence-transformers to measure meaning preservation
- Evaluates how well the generated text captures the original meaning
- Independent of exact wording

### 4. **Readability Metrics**
- **Flesch Reading Ease** (0-100, higher is easier)
  - 90-100: Very easy (5th grade)
  - 60-70: Standard (8th-9th grade)
  - 0-30: Very difficult (college graduate)
- **Flesch-Kincaid Grade**: US grade level required
- **Gunning Fog Index**: Years of education needed
- **SMOG Index**: Simple Measure of Gobbledygook
- **Automated Readability Index (ARI)**
- **Coleman-Liau Index**

### 5. **Text Statistics**
- Character count
- Word count
- Sentence count
- Syllable count
- Lexicon count (unique words)

### 6. **Performance Metrics**
- Response latency (seconds)
- Tokens per second
- API reliability

## 🚀 Quick Start

### Installation

Install required dependencies:

```bash
pip install nltk rouge-score textstat sentence-transformers torch
```

### Run Benchmarks

Run all text benchmarks:

```bash
cd benchmarks
python benchmark_text_quality.py
```

Run specific benchmark types:

```bash
# Only summarization
python benchmark_text_quality.py --type summarization

# Only idea generation
python benchmark_text_quality.py --type ideas

# Only content refinement
python benchmark_text_quality.py --type refinement
```

### Configuration

Set your API keys in environment variables or `.env` file:

```bash
export GEMINI_API_KEY="your_gemini_key"
export GROK_API_KEY="your_grok_key"
```

## 📈 Benchmark Types

### 1. Summarization Benchmark

Tests the ability to condense long texts into concise summaries while preserving meaning.

**Evaluation Criteria:**
- BLEU score vs reference summary
- ROUGE scores (especially ROUGE-L)
- Semantic similarity
- Summary length appropriateness
- Readability of output

**Test Cases:**
- Technical articles (AI, Science)
- News articles
- Long-form content

### 2. Idea Generation Benchmark

Tests creativity, diversity, and relevance of generated ideas.

**Evaluation Criteria:**
- Word count and diversity
- Readability
- Response completeness
- Generation speed
- Idea structure and formatting

**Test Cases:**
- Business/startup ideas
- Content creation topics
- Game development concepts

### 3. Content Refinement Benchmark

Tests the ability to improve text quality while preserving meaning.

**Evaluation Criteria:**
- Semantic similarity (should stay high)
- Readability improvement
- Grammar correction effectiveness
- Tone adjustment accuracy
- Length appropriateness

**Test Cases:**
- Grammar correction
- Professional tone adjustment
- Clarity improvement
- Engagement enhancement

## 📊 Reading Results

### Example Output

```
Provider Comparison:
Metric                    Gemini          Grok            Winner    
----------------------------------------------------------------------
Latency (s)              1.23            1.45            Gemini    
BLEU Score               0.487           0.512           Grok      
ROUGE-L                  0.623           0.645           Grok      
Semantic Sim             0.834           0.819           Gemini    
Readability              62.3            58.7            Gemini    
Words                    87              94              Grok      
```

### Interpreting Scores

**High-quality text generation should have:**
- BLEU > 0.4 (for summarization)
- ROUGE-L > 0.5 (for summarization)
- Semantic Similarity > 0.75
- Flesch Reading Ease: 60-70 (standard readability)
- Low latency (< 2 seconds)

## 🔄 Continuous Monitoring

### Automated Benchmarking

Run benchmarks on a schedule:

```bash
# Add to crontab for daily benchmarks
0 2 * * * cd /path/to/project/benchmarks && python benchmark_text_quality.py
```

### Integration with CI/CD

Add to your CI pipeline:

```yaml
- name: Run Text Quality Benchmarks
  run: |
    pip install -r benchmarks/requirements.txt
    python benchmarks/benchmark_text_quality.py
    
- name: Upload Benchmark Results
  uses: actions/upload-artifact@v3
  with:
    name: text-benchmark-results
    path: benchmarks/benchmark_results/text/
```

## 📁 Results Structure

Results are saved in JSON format:

```json
{
  "benchmark_type": "summarization",
  "timestamp": "20251216_143022",
  "raw_results": {
    "gemini": [
      {
        "latency": 1.23,
        "bleu": 0.487,
        "rouge1_f": 0.612,
        "rouge2_f": 0.423,
        "rougeL_f": 0.623,
        "semantic_similarity": 0.834,
        "flesch_reading_ease": 62.3,
        "word_count": 87,
        "output": "Generated summary text..."
      }
    ],
    "grok": [...]
  },
  "aggregated": {
    "gemini": {
      "avg_latency": 1.23,
      "avg_bleu": 0.487,
      ...
    },
    "grok": {...}
  }
}
```

## 🎯 Best Practices

1. **Run Multiple Samples**: Use at least 5-10 test cases per benchmark type for reliable results
2. **Diverse Test Cases**: Include various content types and difficulty levels
3. **Track Over Time**: Monitor metrics across model updates
4. **Compare Temperatures**: Test different creativity levels (0.3-1.0)
5. **Rate Limiting**: Add delays between API calls to avoid throttling

## 📚 References

- [BLEU Paper](https://www.aclweb.org/anthology/P02-1040.pdf)
- [ROUGE Paper](https://www.aclweb.org/anthology/W04-1013.pdf)
- [Sentence-BERT](https://arxiv.org/abs/1908.10084)
- [Textstat Documentation](https://pypi.org/project/textstat/)

## 🐛 Troubleshooting

### NLTK Data Not Found

```bash
python -c "import nltk; nltk.download('punkt')"
```

### Torch Installation Issues

```bash
# CPU version
pip install torch --index-url https://download.pytorch.org/whl/cpu

# Or with conda
conda install pytorch cpuonly -c pytorch
```

### API Rate Limiting

If you encounter rate limit errors:
- Increase delays between API calls
- Use fewer test samples initially
- Check your API quota

## 📞 Support

For issues or questions:
- Check the main [README.md](../README.md)
- Review API provider documentation
- Open an issue on GitHub
