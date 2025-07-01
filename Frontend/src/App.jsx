// App.jsx
import { useState, useEffect, useRef } from 'react';
import "prismjs/themes/prism-tomorrow.css";
import Editor from "react-simple-code-editor";
import prism from "prismjs";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import axios from 'axios';
import './App.css';
import { ToastContainer, toast } from 'react-toastify';
import { FiSun, FiMoon, FiSearch, FiChevronUp, FiCopy } from 'react-icons/fi';
import { FaRegThumbsUp, FaRegThumbsDown } from 'react-icons/fa';

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [typingEffect, setTypingEffect] = useState('');
  const [typingComplete, setTypingComplete] = useState(false);
  const mainRef = useRef(null);
  const reviewRef = useRef(null);

  useEffect(() => {
    prism.highlightAll();
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      setDarkMode(false);
    }

    const handleScroll = () => {
      if (mainRef.current) {
        setScrolled(mainRef.current.scrollTop > 10);
      }
    };

    if (mainRef.current) {
      mainRef.current.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (mainRef.current) {
        mainRef.current.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (review && !typingComplete) {
      let i = 0;
      const typingInterval = setInterval(() => {
        if (i < review.length) {
          setTypingEffect(review.substring(0, i));
          i++;
        } else {
          clearInterval(typingInterval);
          setTypingComplete(true);
        }
      }, 10);

      return () => clearInterval(typingInterval);
    }
  }, [review, typingComplete]);

  async function reviewCode() {
    if (!code.trim()) {
      toast.warning("Please write some code first!");
      return;
    }

    try {
      setLoading(true);
      setTypingComplete(false);
      setFeedbackGiven(false);
      const response = await axios.post('https://solvinger-v1.onrender.com/ai/get-review', { code });
      
      if (response.data) {
        setReview(response.data.message || response.data);
      } else {
        setReview("No review available.");
      }
    } catch (error) {
      console.error("Error fetching review:", error);
      toast.error("An error occurred while fetching the review.");
      setReview("Failed to get review. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const scrollToTop = () => {
    if (mainRef.current) {
      mainRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
  };

  const giveFeedback = (positive) => {
    setFeedbackGiven(true);
    toast.success(`Thank you for your ${positive ? 'positive' : 'negative'} feedback!`);
  };

  return (
    <div className={`app-container ${darkMode ? 'dark' : 'light'}`}>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-brand">
          <h1 style={{ 
            background: 'linear-gradient(90deg, #ff0000, #00ff00, #0000ff)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            fontWeight: 'bold'
          }}>
            FinderAI
          </h1>
        </div>
        <div className="navbar-actions">
          <button 
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <FiSun /> : <FiMoon />}
          </button>
        </div>
      </nav>

      <main ref={mainRef}>
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="left">
          <div className="code">
            <Editor
              value={code}
              onValueChange={code => setCode(code)}
              highlight={code => prism.highlight(code, prism.languages.javascript, "javascript")}
              padding={15}
              placeholder="Welcome to FinderAI\n\nStart typing your code here to get an intelligent review..."
              style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 14,
                borderRadius: "8px",
                height: "100%",
                width: "100%",
                overflow: "auto",
                backgroundColor: darkMode ? '#0c0c0c' : '#f8f8f8',
                color: darkMode ? '#f8f8f8' : '#333'
              }}
            />
          </div>
          <button
            onClick={reviewCode}
            disabled={loading}
            className={`review-button ${loading ? 'loading' : ''}`}
            style={{
              background: 'linear-gradient(90deg, #ff0000, #00ff00, #0000ff)',
              backgroundSize: '200% auto',
              animation: 'gradient 3s linear infinite'
            }}
          >
            {loading ? (
              <span className="loading-spinner"></span>
            ) : (
              <>
                <FiSearch className="icon" />
                Analyze Code
              </>
            )}
          </button>
        </div>
        <div className="right">
          <div className="markdown-output" ref={reviewRef}>
            {review ? (
              <>
                <Markdown rehypePlugins={[rehypeHighlight]}>
                  {typingComplete ? review : typingEffect}
                </Markdown>
                {typingComplete && !feedbackGiven && (
                  <div className="feedback-buttons">
                    <p>Was this review helpful?</p>
                    <div>
                      <button 
                        className="feedback-button positive" 
                        onClick={() => giveFeedback(true)}
                      >
                        <FaRegThumbsUp /> Yes
                      </button>
                      <button 
                        className="feedback-button negative" 
                        onClick={() => giveFeedback(false)}
                      >
                        <FaRegThumbsDown /> No
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="placeholder">
                <h2>Welcome to FinderAI</h2>
                <p>Write your code in the editor and click "Analyze Code" to get an intelligent review.</p>
                <p>Our AI will analyze your code for potential issues, optimizations, and best practices.</p>
              </div>
            )}
          </div>
        </div>
        {scrolled && (
          <button className="scroll-to-top" onClick={scrollToTop}>
            <FiChevronUp />
          </button>
        )}
      </main>
    </div>
  );
}

export default App;