const fetch = require('node-fetch');

async function createTestUser() {
  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'password123',
        name: 'Test User',
        phone: '1234567890'
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Test user created successfully:');
      console.log('Email: test@test.com');
      console.log('Password: password123');
      console.log('User ID:', data.data.user.id);
    } else {
      console.log('❌ Failed to create test user:', data);
    }
  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
  }
}

createTestUser();
