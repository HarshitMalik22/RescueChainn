import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Define types for the form data
interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Signup component
export const Signup = () => {
  // Form data state
  const [formData, setFormData] = useState<SignupFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Error state
  const [error, setError] = useState<string>('');

  // Handle input changes
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
    const { name, email, password, confirmPassword } = formData;

    // Validate fields
    if (!name || !email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // You can send the data to your backend here
    console.log('User signed up:', { name, email, password });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-md"
      >
        {/* Form heading */}
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>

        {/* Error message */}
        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        {/* Name field */}
        <label className="block mb-2 font-medium">Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full mb-4 px-3 py-2 border border-gray-300 rounded"
          placeholder="Your name"
        />

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

        {/* Confirm password field */}
        <label className="block mb-2 font-medium">Confirm Password</label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="w-full mb-4 px-3 py-2 border border-gray-300 rounded"
          placeholder="Confirm your password"
        />

        {/* Submit button */}
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition duration-200"
        >
          Sign Up
        </button>

        {/* Link to login */}
        <p className="mt-4 text-sm text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};
