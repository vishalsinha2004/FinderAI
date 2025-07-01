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
import 'react-toastify/dist/ReactToastify.css';
import { FiSun, FiMoon, FiCopy, FiSearch, FiSend } from 'react-icons/fi';
import { RiRobot2Line, RiMagicLine } from 'react-icons/ri';
import { TbSparkles } from 'react-icons/tb';
import logo from './assets/fm.png';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : true;
  });
  const [code, setCode] = useState(`// Welcome to FinderAI Reviewer!\n// Write your code here and click "Get Review"\n\nfunction example() {\n  // AI will analyze this code\n  const message = "Hello, FinderAI!";\n  console.log(message);\n  return message;\n}`);
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState('');
  const [typingEffect, setTypingEffect] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const reviewEndRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    prism.highlightAll();
    document.body.className = darkMode ? 'dark' : 'light';
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    if (review) {
      animateReview(review);
    }
  }, [review]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current._input.focus();
    }
  }, []);

  const animateReview = (text) => {
    let i = 0;
    setIsTyping(true);
    setTypingEffect('');
    
    const typingInterval = setInterval(() => {
      if (i < text.length) {
        setTypingEffect(prev => prev + text.charAt(i));
        i++;
        scrollToBottom();
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
      }
    }, 10);
  };

  const scrollToBottom = () => {
    reviewEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  async function reviewCode() {
    if (!code.trim()) {
      toast.warning("Please write some code first");
      return;
    }

    try {
      setLoading(true);
      setReview('');
      const response = await axios.post('https://solvinger-v1.onrender.com/ai/get-review', { code });
      setReview(response.data.message || response.data || "No review available.");
    } catch (error) {
      console.error("Error fetching review:", error);
      toast.error("An error occurred while fetching the review.");
      setReview("⚠️ Failed to get review. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code)
      .then(() => {
        toast.success("Code copied to clipboard!");
        // Add visual feedback
        const editor = document.querySelector('.code');
        editor.classList.add('copied-effect');
        setTimeout(() => {
          editor.classList.remove('copied-effect');
        }, 1000);
      })
      .catch(() => toast.error("Failed to copy code"));
  };

  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      reviewCode();
    }
  };

  const formatCode = () => {
    try {
      // Simple formatting for demonstration
      const formatted = code
        .replace(/\b(function|if|else|for|while|switch|case|return)\b/g, '\n$& ')
        .replace(/\{\s*/g, ' {\n  ')
        .replace(/\}\s*/g, '\n}\n')
        .replace(/\;\s*/g, ';\n  ');
      setCode(formatted);
      toast.success("Code formatted!");
    } catch (e) {
      toast.error("Couldn't format code");
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand">
          <img src={logo} alt="Finder Logo" className="logo-img" />
          <span>FinderAI Reviewer</span>
          <div className="logo-pulse"></div>
        </div>
        <div className="navbar-actions">
          <button 
            className="format-button" 
            onClick={formatCode}
            aria-label="Format code"
            title="Format Code (Ctrl+Shift+F)"
          >
            <RiMagicLine size={18} />
          </button>
          <button 
            className="copy-button" 
            onClick={copyToClipboard} 
            aria-label="Copy code"
            title="Copy Code (Ctrl+C)"
          >
            <FiCopy size={18} />
          </button>
          <button 
            onClick={() => setDarkMode(!darkMode)} 
            className="theme-toggle"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            title={darkMode ? "Light Mode" : "Dark Mode"}
          >
            {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>
        </div>
      </nav>

      <main className={darkMode ? 'dark' : 'light'} onKeyDown={handleKeyDown}>
        <ToastContainer 
          position="top-right" 
          autoClose={3000}
          theme={darkMode ? 'dark' : 'light'}
          toastStyle={{
            backdropFilter: 'blur(10px)',
            background: darkMode ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
          }}
        />
        
        <div className="left">
          <div className="code" ref={editorRef}>
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
            disabled={loading || isTyping}
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
                  <FiSend className="button-icon" />
                </>
              )
            )}
          </button>
          <div className="hint-text">
            <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to submit
          </div>
        </div>
        
        <div className="right">
          {review || isTyping ? (
            <div className="review-content">
              <Markdown rehypePlugins={[rehypeHighlight]}>
                {isTyping ? typingEffect : review}
              </Markdown>
              {isTyping && (
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              )}
              <div ref={reviewEndRef} />
            </div>
          ) : (
            <div className="placeholder">
              <RiRobot2Line size={48} className="robot-icon" />
              <h3>AI Code Review</h3>
              <p>Your AI-powered code review will appear here</p>
              <div className="sparkles">
                <TbSparkles size={24} />
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default App;