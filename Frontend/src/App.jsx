import { useState, useEffect } from 'react';
import "prismjs/themes/prism-tomorrow.css";
import Editor from "react-simple-code-editor";
import prism from "prismjs";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import axios from 'axios';
import './App.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiSun, FiMoon, FiCopy, FiSearch } from 'react-icons/fi';
import { RiRobot2Line } from 'react-icons/ri';
import logo from './assets/fm.png';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : true;
  });
  const [code, setCode] = useState(`// Welcome to FinderAI Reviewer!\n// Write your Contain here and click "Get Review"`);
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState('');

  useEffect(() => {
    prism.highlightAll();
    document.body.className = darkMode ? 'dark' : 'light';
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  async function reviewCode() {
    if (!code.trim()) {
      toast.warning("Please write some code first");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('https://solvinger-v1.onrender.com/ai/get-review', { code });
      setReview(response.data.message || response.data || "No review available.");
    } catch (error) {
      console.error("Error fetching review:", error);
      toast.error("An error occurred while fetching the review.");
    } finally {
      setLoading(false);
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code)
      .then(() => toast.success("Code copied to clipboard!"))
      .catch(() => toast.error("Failed to copy code"));
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand">
          <img src={logo} alt="Finder Logo" className="logo-img" />
          <span>FinderAI...</span>
        </div>
        <div className="navbar-actions">
          <button className="copy-button" onClick={copyToClipboard} aria-label="Copy code">
            <FiCopy size={18} />
          </button>
          <button 
            onClick={() => setDarkMode(!darkMode)} 
            className="theme-toggle"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>
        </div>
      </nav>

      <main className={darkMode ? 'dark' : 'light'}>
        <ToastContainer 
          position="top-right" 
          autoClose={3000}
          theme={darkMode ? 'dark' : 'light'}
          toastStyle={{
            backdropFilter: 'blur(10px)',
            background: darkMode ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
          }}
        />
        
        <div className="left">
          <div className="code">
            <Editor
              value={code}
              onValueChange={setCode}
              highlight={code => prism.highlight(code, prism.languages.javascript, "javascript")}
              padding={18}
              style={{
                fontFamily: '"Fira Code", "Fira Mono", monospace',
                fontSize: 15,
                backgroundColor: 'var(--editor-bg)',
                color: 'var(--editor-text)',
                borderRadius: '1rem',
                height: '100%',
                width: '100%',
                overflow: 'auto',
                lineHeight: '1.6',
                border: 'none'
              }}
            />
          </div>
          <div className="code-info">
            {code.split('\n').length} lines | {code.length} chars | {code.split(/\s+/).length} words
          </div>
          <button
            onClick={reviewCode}
            className={`review-button ${loading ? 'loading' : ''}`}
            disabled={loading}
            aria-label="Get code review"
          >
            {loading ? (
              <span className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </span>
            ) : (
              code.trim() === '' ? "Write Something" : (
                <>
                  <span className="button-text">Get Review</span>
                  <FiSearch className="button-icon" />
                </>
              )
            )}
          </button>
        </div>
        
        <div className="right">
          {review ? (
            <Markdown rehypePlugins={[rehypeHighlight]}>
              {review}
            </Markdown>
          ) : (
            <div className="placeholder">
              <RiRobot2Line size={48} className="rgb-animate" />
              <h3>Review Output</h3>
              <p>Your AI-powered Finder... review will appear here after you click the "Get Review" button</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default App;