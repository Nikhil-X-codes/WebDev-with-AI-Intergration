import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SignIn, SignUp, GoogleOneTap, SignedIn, SignedOut } from '@clerk/clerk-react';
import Layout from './components/Layout';

import HomePage from './pages/HomePage';
import ArticleWriter from './pages/ArticleWriter';
import BlogTitleGenerator from './pages/BlogTitleGenerator';
import QuoteGenerator from './pages/QuoteGenerator';
import Rewriter from './pages/Rewriter';
import ResumeReviewer from './pages/ResumeReviewer';
import FileUploadChat from './pages/FileUploadChat';
import TicketClassifier from './pages/TicketClassifier';
import AIDetector from './pages/AIDetector';


function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <SignedOut>
                  <Navigate to="/sign-in" replace />
                </SignedOut>
                <SignedIn>
                  <Navigate to="/home" replace />
                </SignedIn>
              </>
            }
          />

          <Route
            path="/home"
            element={
              <SignedIn>
                <HomePage />
              </SignedIn>
            }
          />

          <Route path="/article-writer" element={<><SignedIn><ArticleWriter /></SignedIn><SignedOut><SignIn routing="path" path="/sign-in" /></SignedOut></>} />
          <Route path="/blog-title-generator" element={<><SignedIn><BlogTitleGenerator /></SignedIn><SignedOut><SignIn routing="path" path="/sign-in" /></SignedOut></>} />
          <Route path="/quote-generator" element={<><SignedIn><QuoteGenerator /></SignedIn><SignedOut><SignIn routing="path" path="/sign-in" /></SignedOut></>} />
          <Route path="/rewriter" element={<><SignedIn><Rewriter /></SignedIn><SignedOut><SignIn routing="path" path="/sign-in" /></SignedOut></>} />
          <Route path="/resume-reviewer" element={<><SignedIn><ResumeReviewer /></SignedIn><SignedOut><SignIn routing="path" path="/sign-in" /></SignedOut></>} />
          <Route path="/file-upload-chat" element={<><SignedIn><FileUploadChat /></SignedIn><SignedOut><SignIn routing="path" path="/sign-in" /></SignedOut></>} />
          <Route path="/ticket-classifier" element={<><SignedIn><TicketClassifier /></SignedIn><SignedOut><SignIn routing="path" path="/sign-in" /></SignedOut></>} />
          <Route path="/ai-detector" element={<><SignedIn><AIDetector /></SignedIn><SignedOut><SignIn routing="path" path="/sign-in" /></SignedOut></>} />

          <Route
            path="/sign-in/*"
            element={
              <div className="flex flex-col items-center min-h-[60vh] justify-center gap-8">
                <SignIn routing="path" path="/sign-in" afterSignInUrl="/home" />
                <GoogleOneTap />
              </div>
            }
          />
          <Route
            path="/sign-up/*"
            element={
              <div className="flex flex-col items-center min-h-[60vh] justify-center gap-8">
                <SignUp routing="path" path="/sign-up" afterSignUpUrl="/home" />
                <GoogleOneTap />
              </div>
            }
          />

        </Routes>
      </Layout>
    </Router>
  );
}

export default App;