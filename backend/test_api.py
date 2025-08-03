#!/usr/bin/env python3
"""
Test script for Smart Content Studio AI Backend API
Tests all endpoints to ensure they're working correctly
"""

import httpx
import json
import asyncio

API_BASE_URL = "http://localhost:8000"

async def test_endpoints():
    """Test all API endpoints"""
    async with httpx.AsyncClient() as client:
        
        print("🧪 Testing Smart Content Studio AI Backend API")
        print("=" * 50)
        
        # Test health check
        print("\n1. Testing health check...")
        try:
            response = await client.get(f"{API_BASE_URL}/")
            print(f"✅ Health check: {response.status_code} - {response.json()}")
        except Exception as e:
            print(f"❌ Health check failed: {e}")
        
        # Test detailed health
        print("\n2. Testing detailed health...")
        try:
            response = await client.get(f"{API_BASE_URL}/health")
            print(f"✅ Detailed health: {response.status_code} - {response.json()}")
        except Exception as e:
            print(f"❌ Detailed health failed: {e}")
        
        # Test summarizer
        print("\n3. Testing summarizer...")
        summarize_data = {
            "text": "Artificial intelligence is revolutionizing various industries. Machine learning algorithms can process vast amounts of data to identify patterns and make predictions. This technology is being applied in healthcare, finance, transportation, and many other sectors to improve efficiency and outcomes."
        }
        try:
            response = await client.post(f"{API_BASE_URL}/api/summarize", json=summarize_data)
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Summarizer: {response.status_code}")
                print(f"   Output: {result['output'][:100]}...")
            else:
                print(f"❌ Summarizer failed: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"❌ Summarizer error: {e}")
        
        # Test idea generator
        print("\n4. Testing idea generator...")
        ideas_data = {
            "topic": "sustainable technology"
        }
        try:
            response = await client.post(f"{API_BASE_URL}/api/generate-ideas", json=ideas_data)
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Idea generator: {response.status_code}")
                print(f"   Output: {result['output'][:100]}...")
            else:
                print(f"❌ Idea generator failed: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"❌ Idea generator error: {e}")
        
        # Test content refiner
        print("\n5. Testing content refiner...")
        refine_data = {
            "text": "this is some text that needs improvement",
            "instruction": "make it more formal and professional"
        }
        try:
            response = await client.post(f"{API_BASE_URL}/api/refine-content", json=refine_data)
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Content refiner: {response.status_code}")
                print(f"   Output: {result['output'][:100]}...")
            else:
                print(f"❌ Content refiner failed: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"❌ Content refiner error: {e}")
        
        # Test chatbot
        print("\n6. Testing chatbot...")
        chat_data = {
            "message": "Hello, can you help me with content creation?"
        }
        try:
            response = await client.post(f"{API_BASE_URL}/api/chat", json=chat_data)
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Chatbot: {response.status_code}")
                print(f"   Output: {result['output'][:100]}...")
            else:
                print(f"❌ Chatbot failed: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"❌ Chatbot error: {e}")
        
        print("\n" + "=" * 50)
        print("🎉 API testing complete!")

if __name__ == "__main__":
    asyncio.run(test_endpoints())
