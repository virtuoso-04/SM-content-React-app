// Test script to verify chatbot functionality
// Run this in browser console on the chatbot page

async function testChatbot() {
    console.log('Testing chatbot API integration...');
    
    try {
        // Import the API function (if available in window scope)
        const response = await fetch('http://localhost:8000/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: 'Hello from frontend test!'
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ API Response:', data);
            console.log('✅ Output:', data.output);
            return data;
        } else {
            console.error('❌ API Error:', response.status, response.statusText);
            const errorData = await response.text();
            console.error('Error details:', errorData);
        }
    } catch (error) {
        console.error('❌ Network Error:', error);
    }
}

// Run the test
testChatbot();
