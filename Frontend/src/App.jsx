import { useState, useEffect } from 'react';
import "prismjs/themes/prism-tomorrow.css";
import Editor from "react-simple-code-editor";
import prism from "prismjs";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import axios from 'axios';
import { ToastContainer, toast } from "react-toastify";
import './App.css';

function App() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    prism.highlightAll();
    
    if (sessionStorage.getItem('visited') === 'true') {
      setShowWelcome(false);
      setReview(`# Welcome to FinderAI...✨\n\nYour AI-powered coding assistant is ready to help with:\n\n🔍 **Code Review** - Find bugs and optimize your code\n📚 **Learning** - Get explanations for programming concepts\n💡 **Solutions** - Receive implementations for coding problems\n\n## How to use:\n1. Write your code in the editor below\n2. Click the "Search" button\n3. Get instant AI-powered analysis\n\n### Try these examples:\n\n\`\`\`javascript\n// 1. Find bugs in this function\nfunction calculateSum(arr) {\n  let sum = 0;\n  for (let i = 0; i <= arr.length; i++) {\n    sum += arr[i];\n  }\n  return sum;\n}\n\`\`\`\n\n\`\`\`python\n# 2. Optimize this Python code\ndef factorial(n):\n    if n == 0:\n        return 1\n    else:\n        return n * factorial(n-1)\n\`\`\`\n\nOr ask questions like:\n\n* "Explain how recursion works in JavaScript"\n* "Show me how to implement a binary search in Python"\n* "What's wrong with this React component?"\n\n💡 **Tip**: The more specific your question, the better the answer!`);
    } else {
      const timer = setTimeout(() => {
        sessionStorage.setItem('visited', 'true');
        setShowWelcome(false);
        setReview(`# Welcome to FinderAI...✨\n\nYour AI-powered coding assistant is ready to help with:\n\n🔍 **Code Review** - Find bugs and optimize your code\n📚 **Learning** - Get explanations for programming concepts\n💡 **Solutions** - Receive implementations for coding problems\n\n## How to use:\n1. Write your code in the editor below\n2. Click the "Search" button\n3. Get instant AI-powered analysis\n\n### Try these examples:\n\n\`\`\`javascript\n// 1. Find bugs in this function\nfunction calculateSum(arr) {\n  let sum = 0;\n  for (let i = 0; i <= arr.length; i++) {\n    sum += arr[i];\n  }\n  return sum;\n}\n\`\`\`\n\n\`\`\`python\n# 2. Optimize this Python code\ndef factorial(n):\n    if n == 0:\n        return 1\n    else:\n        return n * factorial(n-1)\n\`\`\`\n\nOr ask questions like:\n\n* "Explain how recursion works in JavaScript"\n* "Show me how to implement a binary search in Python"\n* "What's wrong with this React component?"\n\n💡 **Tip**: The more specific your question, the better the answer!`);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, []);

  async function reviewCode() {
    try {
      if (!code.trim()) {
        toast.warning("Please write some code or ask a question first!");
        return;
      }

      setLoading(true);
      const response = await axios.post('https://solvinger-v1.onrender.com/ai/get-review', { code });

      if (response.data) {
        setReview(response.data.message || response.data);
      } else {
        setReview("## No response received\n\nPlease try again or check your connection.");
      }
    } catch (error) {
      console.error("Error fetching review:", error);
      toast.error("Failed to get analysis. Please try again.");
      setReview(`## Error Occurred\n\nWe couldn't process your request. Possible issues:\n\n- Network connection problem\n- Server temporarily unavailable\n- Your code might be too large\n\n\`\`\`\n${error.message}\n\`\`\``);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {showWelcome ? (
        <div className="welcome-page">
          <div className="welcome-content">
            <h1>FinderAI...</h1>
            <p>Your AI-powered coding assistant is loading...</p>
            <div className="loading-bar">
              <div className="loading-progress"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="app-container">
          <ToastContainer 
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
          <div className="results-container">
            <Markdown rehypePlugins={[rehypeHighlight]}>{review}</Markdown>
          </div>
          <div className="editor-container">
            <div className="code">
              <Editor
                value={code}
                onValueChange={code => setCode(code)}
                highlight={code => prism.highlight(code, prism.languages.javascript, "javascript")}
                padding={20}
                placeholder="Enter your code here or ask a coding question..."
                style={{
                  fontFamily: '"Fira code", "Fira Mono", monospace',
                  fontSize: 16,
                  backgroundColor: '#0c0c0c',
                  height: "100%",
                  width: "100%",
                }}
              />
            </div>
            <button
              onClick={reviewCode}
              className="review"
              disabled={loading}
            >
              {loading ? "Deep Searching ..." : "Search"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;