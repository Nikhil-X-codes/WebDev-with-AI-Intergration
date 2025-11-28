import React from 'react';
import { Link } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';


const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">

      <header className="bg-white shadow-md">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
            🤖 AI Productivity Toolkit
          </Link>

          <div className="flex items-center gap-4">
            <SignedOut>
              <Link 
                to="/sign-in" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/sign-up" 
                className="bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-600 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Sign Up
              </Link>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="bg-white mt-12 py-6 text-center text-gray-600 border-t">
        <p>&copy; 2025 AI Productivity Toolkit. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;
