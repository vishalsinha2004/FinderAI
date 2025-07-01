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
import logo from './assets/fm.png';

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [code, setCode] = useState(`function sum() {
  return 1 + 1
}`);
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState('');

  useEffect(() => {
    prism.highlightAll();
    document.body.className = darkMode ? 'dark-mode' : 'light-mode';
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
          <button className="copy-button" onClick={copyToClipboard}>
            <FiCopy /> 
          </button>
          <button onClick={() => setDarkMode(!darkMode)} className="theme-toggle">
            {darkMode ? <FiSun /> : <FiMoon />}
          </button>
        </div>
      </nav>

      <main className={darkMode ? 'dark' : 'light'}>
        <ToastContainer position="top-right" autoClose={3000} />
        
        <div className="left">
          <div className="code">
            <Editor
              value={code}
              onValueChange={setCode}
              highlight={code => prism.highlight(code, prism.languages.javascript, "javascript")}
              padding={15}
              style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 16,
                backgroundColor: darkMode ? '#0c0c0c' : '#f8f8f8',
                color: darkMode ? '#f8f8f2' : '#333',
                border: darkMode ? "1px solid #333" : "1px solid #ddd",
                borderRadius: "0.7rem",
                height: "100%",
                width: "100%",
                overflow: "auto",
                lineHeight: '1.5',
              }}
            />
          </div>
          <div className="code-info">
            {code.split('\n').length} lines | {code.length} chars
          </div>
          <button
            onClick={reviewCode}
            className={`review-button ${loading ? 'loading' : ''}`}
            disabled={loading}
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
              <h3>Code Review Output</h3>
              <p>Your code review will appear here after you click the "Get Review" button</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default App;