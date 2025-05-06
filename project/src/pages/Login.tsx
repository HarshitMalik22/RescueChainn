import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Interface to define types of login form fields
interface LoginFormData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  // State to store form inputs
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  // State to hold error messages
  const [error, setError] = useState<string>('');

  // Handle input change for both fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const { email, password } = formData;

    if (!email || !password) {
      setError('Both email and password are required.');
      return;
    }

    // Simulate login (replace with actual backend API call)
    console.log('Logging in user:', { email, password });

    // Clear form and error
    setFormData({ email: '', password: '' });
    setError('');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-md"
      >
        {/* Form heading */}
        <h2 className="text-xl font-semibold text-center mb-4">Login</h2>

        {/* Display error message */}
        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        {/* Email field */}
        <label className="block mb-2 font-medium">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full mb-4 px-3 py-2 border border-gray-300 rounded"
          placeholder="you@example.com"
        />

        {/* Password field */}
        <label className="block mb-2 font-medium">Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="w-full mb-4 px-3 py-2 border border-gray-300 rounded"
          placeholder="Your password"
        />

        {/* Submit button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-200"
        >
          Login
        </button>

        {/* Link to sign up */}
        <p className="mt-4 text-sm text-center">
          Don’t have an account?{' '}
          <Link to="/signup" className="text-green-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
