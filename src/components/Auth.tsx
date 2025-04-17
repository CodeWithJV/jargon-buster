import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Brain } from 'lucide-react'; // 🧠 Import the brain icon

export function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (type: 'LOGIN' | 'SIGNUP') => {
    console.log('🔑 handleLogin called with type:', type);
    setLoading(true);
    setError(null);
    setMessage(null);

    if (type === 'LOGIN') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      console.log('📬 Login response:', { data, error });
      if (error) setError(error.message);
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      console.log('📬 Signup response:', { data, error });
      if (error) setError(error.message);
      else setMessage("✅ Sign-up successful! Please check your inbox to confirm your email.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-start justify-center pt-80 bg-gray-50">
      <div className="p-4 flex flex-col gap-3 max-w-sm w-full bg-white shadow-md rounded-md">
        
        {/* 🧠 Title with Brain Icon */}
        <div className="flex justify-center items-center gap-2">
          <Brain className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-center">Welcome to Jargon Buster</h2>
        </div>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border p-2 rounded w-full"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="border p-2 rounded w-full"
        />

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        {message && <p className="text-green-600 text-sm text-center">{message}</p>}

        {loading && (
          <div className="flex justify-center">
            <svg
              className="animate-spin h-6 w-6 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
          </div>
        )}

        <p className="text-sm text-gray-600 text-center">
          Don't have an account?<br />
          Enter your email and a password, then click <strong>Sign Up</strong> to create one.
        </p>

        <button
          onClick={() => handleLogin('LOGIN')}
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
        >
          Log In
        </button>

        <button
          onClick={() => handleLogin('SIGNUP')}
          className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
