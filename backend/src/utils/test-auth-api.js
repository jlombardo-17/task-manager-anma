// Script to test the auth API
const axios = require('axios');

async function testAuthApi() {
  console.log('Testing Auth API...');
  
  try {
    // Test 1: Prueba el endpoint /api/auth/test
    console.log('\n1. Testing /api/auth/test endpoint:');
    const testResponse = await axios.get('http://localhost:5000/api/auth/test');
    console.log('Status:', testResponse.status);
    console.log('Response:', testResponse.data);

    // Test 2: Intento de inicio de sesión con admin@example.com
    console.log('\n2. Testing login with admin@example.com:');
    try {
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'admin@example.com',
        password: 'admin123'
      });
      console.log('Status:', loginResponse.status);
      console.log('Response:', loginResponse.data);
    } catch (error) {
      console.log('Login failed:');
      console.log('Status:', error.response?.status);
      console.log('Error message:', error.response?.data);
      console.log('Raw error:', error.message);
    }

    // Test 3: Intento con credenciales inválidas
    console.log('\n3. Testing login with invalid credentials:');
    try {
      const invalidLoginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'wrong@example.com',
        password: 'wrongpassword'
      });
      console.log('Status:', invalidLoginResponse.status);
      console.log('Response:', invalidLoginResponse.data);
    } catch (error) {
      console.log('Invalid login failed as expected:');
      console.log('Status:', error.response?.status);
      console.log('Error message:', error.response?.data);
    }

    // Test 4: Intento con otro usuario de prueba
    console.log('\n4. Testing login with test@example.com:');
    try {
      const testLoginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'test@example.com',
        password: 'test123'
      });
      console.log('Status:', testLoginResponse.status);
      console.log('Response:', testLoginResponse.data);
    } catch (error) {
      console.log('Test login failed:');
      console.log('Status:', error.response?.status);
      console.log('Error message:', error.response?.data);
    }

    // Test 5: Probar registro de un nuevo usuario
    const randomUser = `user${Math.floor(Math.random() * 10000)}`;
    console.log(`\n5. Testing register with ${randomUser}@example.com:`);
    try {
      const registerResponse = await axios.post('http://localhost:5000/api/auth/register', {
        username: randomUser,
        email: `${randomUser}@example.com`,
        password: 'password123'
      });
      console.log('Status:', registerResponse.status);
      console.log('Response:', registerResponse.data);

      // Test login with the newly registered user
      console.log(`\n6. Testing login with newly registered user ${randomUser}@example.com:`);
      const newUserLoginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: `${randomUser}@example.com`,
        password: 'password123'
      });
      console.log('Status:', newUserLoginResponse.status);
      console.log('Response:', newUserLoginResponse.data);
    } catch (error) {
      console.log('Register failed:');
      console.log('Status:', error.response?.status);
      console.log('Error message:', error.response?.data);
    }
  } catch (error) {
    console.error('General error:', error.message);
  }
}

testAuthApi();
