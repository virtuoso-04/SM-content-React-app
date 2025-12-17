"""
Quick visualization of existing benchmark results
"""

import json
import matplotlib.pyplot as plt
import matplotlib.image as mpimg
from pathlib import Path
import os

def visualize_image_benchmarks():
    """Create a visual gallery of generated images"""
    results_dir = Path("benchmark_results")
    
    # Load the latest benchmark
    json_files = list(results_dir.glob("benchmark_results_*.json"))
    if not json_files:
        print("No benchmark results found!")
        return
    
    latest_file = sorted(json_files)[-1]
    print(f"📊 Loading: {latest_file.name}")
    
    with open(latest_file) as f:
        data = json.load(f)
    
    providers = data.get('providers', [])
    prompts = data.get('prompts', [])
    generations = data.get('generations', {})
    
    print(f"✅ Found {len(providers)} provider(s): {', '.join(providers)}")
    print(f"✅ Found {len(prompts)} prompts")
    
    # Create image grid
    for provider in providers:
        images_data = generations.get(provider, [])
        successful_images = [img for img in images_data if img.get('success', False)]
        
        if not successful_images:
            print(f"⚠️  No successful images for {provider}")
            continue
        
        print(f"\n🎨 Creating gallery for {provider.title()}...")
        
        # Determine grid size
        n_images = min(len(successful_images), 12)
        n_cols = 4
        n_rows = (n_images + n_cols - 1) // n_cols
        
        fig, axes = plt.subplots(n_rows, n_cols, figsize=(16, 4*n_rows))
        fig.suptitle(f'🎨 Image Generation Gallery: {provider.title()}', 
                    fontsize=18, fontweight='bold', y=0.98)
        
        if n_rows == 1:
            axes = axes.reshape(1, -1)
        
        for idx, img_data in enumerate(successful_images[:n_images]):
            row = idx // n_cols
            col = idx % n_cols
            ax = axes[row, col]
            
            img_path = Path(img_data['image_path'])
            prompt = img_data['prompt']
            
            if img_path.exists():
                try:
                    img = mpimg.imread(img_path)
                    ax.imshow(img)
                    ax.axis('off')
                    
                    # Add prompt as title (truncated)
                    title = prompt if len(prompt) <= 40 else prompt[:37] + '...'
                    ax.set_title(title, fontsize=9, fontweight='bold', pad=5)
                except Exception as e:
                    ax.text(0.5, 0.5, f'Error loading\n{img_path.name}', 
                           ha='center', va='center', fontsize=10)
                    ax.axis('off')
            else:
                ax.text(0.5, 0.5, f'Image not found\n{img_path.name}', 
                       ha='center', va='center', fontsize=10)
                ax.axis('off')
        
        # Hide unused subplots
        for idx in range(n_images, n_rows * n_cols):
            row = idx // n_cols
            col = idx % n_cols
            axes[row, col].axis('off')
        
        plt.tight_layout()
        
        # Save
        output_dir = results_dir / "reports"
        output_dir.mkdir(parents=True, exist_ok=True)
        output_file = output_dir / f"image_gallery_{provider}.png"
        plt.savefig(output_file, dpi=200, bbox_inches='tight')
        print(f"✅ Saved: {output_file}")
        plt.close()
    
    # Create summary statistics chart
    print("\n📊 Creating summary statistics...")
    
    fig, ax = plt.subplots(1, 1, figsize=(10, 6))
    
    provider_stats = []
    for provider in providers:
        images_data = generations.get(provider, [])
        total = len(images_data)
        successful = len([img for img in images_data if img.get('success', False)])
        provider_stats.append({
            'provider': provider.title(),
            'total': total,
            'successful': successful,
            'success_rate': (successful/total*100) if total > 0 else 0
        })
    
    provider_names = [s['provider'] for s in provider_stats]
    success_rates = [s['success_rate'] for s in provider_stats]
    
    colors = ['#10B981', '#4285F4', '#8B5CF6'][:len(providers)]
    bars = ax.bar(provider_names, success_rates, color=colors, alpha=0.8, 
                  edgecolor='black', linewidth=2)
    
    for bar, stats in zip(bars, provider_stats):
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., height,
               f'{stats["successful"]}/{stats["total"]}\n({height:.1f}%)',
               ha='center', va='bottom', fontweight='bold', fontsize=11)
    
    ax.set_ylim(0, 110)
    ax.set_ylabel('Success Rate (%)', fontweight='bold', fontsize=12)
    ax.set_title('🎯 Image Generation Success Rate', fontsize=16, fontweight='bold', pad=20)
    ax.grid(axis='y', alpha=0.3, linestyle='--')
    
    plt.tight_layout()
    output_file = output_dir / "success_rate_chart.png"
    plt.savefig(output_file, dpi=200, bbox_inches='tight')
    print(f"✅ Saved: {output_file}")
    
    print("\n" + "="*70)
    print("✨ Visualization complete!")
    print(f"📁 Location: {output_dir.absolute()}")

if __name__ == "__main__":
    print("\n🚀 Benchmark Results Visualization")
    print("="*70)
    visualize_image_benchmarks()
