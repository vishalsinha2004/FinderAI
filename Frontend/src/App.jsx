import { useState, useEffect } from 'react';
import { FiSun, FiMoon, FiCopy, FiSearch } from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'highlight.js/styles/github-dark.css';
import logo from './assets/fm.png';
import './App.css';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [code, setCode] = useState(`function sum() {
  return 1 + 1
}`);
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState('');

  useEffect(() => {
    document.body.className = darkMode ? 'dark' : 'light';
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  async function reviewCode() {
    if (!code.trim()) {
      toast.warning("Please write some code first");
      return;
    }

    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock response
      const mockResponse = `
Here's a review of your code:

\`\`\`javascript
${code}
\`\`\`

### Suggestions:
1. The function \`sum()\` is very simple and always returns 2.
2. Consider making it more dynamic by accepting parameters:
   \`\`\`javascript
   function sum(a, b) {
     return a + b;
   }
   \`\`\`
3. Add error handling if needed.
4. Consider adding JSDoc comments for documentation.

### Potential Issues:
- None found in this simple example.

### Performance:
- The function has O(1) time complexity, which is optimal.
      `;

      setReview(mockResponse);
    } catch (error) {
      console.error("Error fetching review:", error);
      toast.error("An error occurred while fetching the review.");
      setReview('');
    } finally {
      setLoading(false);
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code)
      .then(() => toast.success("Code copied to clipboard!"))
      .catch(() => toast.error("Failed to copy code"));
  };

  const getLineCount = () => code.split('\n').length;
  const getCharCount = () => code.length;

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand">
          <img 
            src={logo} 
            alt="Finder Logo" 
            className="logo-img" 
          />
          <span className="finder-text">FinderAI...</span>
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

      <main>
        <ToastContainer position="top-right" autoClose={3000} />
        
        <div className="left">
          <textarea
            className="code-editor"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck="false"
          />
          <div className="code-info">
            {getLineCount()} lines | {getCharCount()} chars
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
            <div dangerouslySetInnerHTML={{ __html: review }} />
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