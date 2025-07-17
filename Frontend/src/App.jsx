import { useState, useEffect } from 'react';
import "prismjs/themes/prism-tomorrow.css";
import Editor from "react-simple-code-editor";
import prism from "prismjs";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import './App.css';

function App() {
  const [code, setCode] = useState(``);
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState(``);
  const [showWelcome, setShowWelcome] = useState(true);
  const [typedText, setTypedText] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);
  const welcomeText = "  FinderAI...   ";

  useEffect(() => {
    prism.highlightAll();
    
    // Check if user has already visited
    if (sessionStorage.getItem('visited') === 'true') {
      setShowWelcome(false);
    } else {
      setReview(`# Welcome to FinderAI! 👋\n\nStart by writing your **code** or **question** in the editor and click "Search" to get AI-powered assistance.\n\n### Key Features:\n\n✅ **Code Analysis** - Get detailed reviews of your code\n\n✅ **Problem Solving** - Find solutions to programming challenges\n\n✅ **Best Practices** - Learn industry-standard approaches\n\n✅ **Error Detection** - Identify and fix issues in your code\n\n*Tip: Try writing a function or ask a coding question to begin!* 🚀`);
      
      // Typing animation
      let i = 0;
      const typingInterval = setInterval(() => {
        if (i < welcomeText.length) {
          setTypedText(prev => prev + welcomeText.charAt(i));
          i++;
        } else {
          clearInterval(typingInterval);
          // Start cursor blink after typing completes
          setInterval(() => {
            setCursorVisible(prev => !prev);
          }, 500);
        }
      }, 100);

      // Auto-enter after animation completes
      const timer = setTimeout(() => {
        sessionStorage.setItem('visited', 'true');
        setShowWelcome(false);
      }, welcomeText.length * 100 + 1500); // Typing time + 1.5s delay

      return () => {
        clearInterval(typingInterval);
        clearTimeout(timer);
      };
    }
  }, []);

  async function reviewCode() {
    try {
      if (!code.trim()) {
        toast.warning("Please write some code first!");
        return;
      }

      setLoading(true);
      const response = await axios.post('https://solvinger-v1.onrender.com/ai/get-review', { code });

      if (response.data) {
        setReview(response.data.message || response.data);
      } else {
        setReview("No review available.");
      }
    } catch (error) {
      console.error("Error fetching review:", error);
      toast.error("An error occurred while fetching the review.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (review) {
      setLoading(false);
    }
  }, [review]);

  return (
    <>
      {showWelcome ? (
        <div className="welcome-page">
          <div className="welcome-content">
            <h1>
              {typedText}
              <span style={{ opacity: cursorVisible ? 1 : 0 }}>|</span>
            </h1>
            <p>Your AI-powered coding assistant is loading...</p>
            <div className="loading-bar">
              <div className="loading-progress"></div>
            </div>
          </div>
        </div>
      ) : (
        <main>
          <ToastContainer />
          <div className="left">
            <div className="code">
              <Editor
                value={code}
                onValueChange={code => setCode(code)}
                highlight={code => prism.highlight(code, prism.languages.javascript, "javascript")}
                padding={10}
                style={{
                  fontFamily: '"Fira code", "Fira Mono", monospace',
                  fontSize: 16,
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  height: "100%",
                  width: "100%",
                  overflow: "scroll"
                }}
              />
            </div>
            <div
              onClick={reviewCode}
              className="review">
              {loading ? " Deep Search..." : (code === null ? "Write Something" : " Search ")}
            </div>
          </div>
          <div className="right">
            <Markdown rehypePlugins={[rehypeHighlight]}>{review}</Markdown>
          </div>
        </main>
      )}
    </>
  );
}

export default App;