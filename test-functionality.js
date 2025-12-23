// Test script to verify functionality
console.log('Testing workout app functionality...');

// Test 1: Check if frontend is accessible
fetch('http://localhost:5174')
  .then(response => {
    if (response.ok) {
      console.log('✅ Frontend is running on port 5174');
    } else {
      console.log('❌ Frontend not accessible');
    }
  })
  .catch(error => {
    console.log('❌ Frontend connection error:', error.message);
  });

// Test 2: Check if backend is accessible
fetch('http://localhost:5000/api/workouts/templates')
  .then(response => {
    if (response.status === 401) {
      console.log('✅ Backend is running and requires authentication (expected)');
    } else {
      console.log('❌ Backend unexpected response:', response.status);
    }
  })
  .catch(error => {
    console.log('❌ Backend connection error:', error.message);
  });

console.log('Test completed. Please check the browser manually for full functionality.');