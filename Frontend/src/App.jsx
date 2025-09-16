import { useState, useEffect, useRef } from 'react';
import Editor from "react-simple-code-editor";
import prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import "highlight.js/styles/github.css"; // Add light theme
import axios from 'axios';
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const welcomeMessage = {
  sender: 'ai',
  content: `## Hello, I'm FinderAI
How can I help you with your code today?`,
};

const TypingLoader = () => (
  <div className="typing-loader">
    <span></span>
    <span></span>
    <span></span>
  </div>
);

function App() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [theme, setTheme] = useState('light'); // Default to light theme
  const scrollRef = useRef(null);

  // Check for saved theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('finderai-theme');
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      // Check for system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    }
  }, []);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  useEffect(() => {
    const isVisited = sessionStorage.getItem('visited') === 'true';
    if (isVisited) {
      setShowWelcome(false);
      setMessages([{ sender: 'ai', content: `## Welcome Back\nReady when you are.` }]);
    } else {
      const timer = setTimeout(() => {
        sessionStorage.setItem('visited', 'true');
        setShowWelcome(false);
        setMessages([welcomeMessage]);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleReviewCode = async () => {
    const trimmedCode = code.trim();
    if (!trimmedCode) {
      toast.info("Please enter something to analyze.");
      return;
    }

    const newMessages = [...messages, { sender: 'user', content: trimmedCode }];
    setMessages(newMessages);
    setCode('');
    setLoading(true);

    try {
      const response = await axios.post('https://solvinger-v1.onrender.com/ai/get-review', { code: trimmedCode });
      setMessages([...newMessages, { sender: 'ai', content: response.data.message || response.data }]);
    } catch (error) {
      console.error("Error fetching review:", error);
      toast.error("An error occurred. Please try again.");
      setMessages([...newMessages, { sender: 'ai', content: "### Error\nI couldn't get a response." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleReviewCode();
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('finderai-theme', newTheme);
  };

  if (showWelcome) {
    return (
      <div className="welcome-page">
        <div className="welcome-content"><h1>FinderAI</h1><p>Loading your AI assistant...</p></div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="theme-toggle" onClick={toggleTheme}>
        {theme === 'light' ? (
          
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/>
          </svg>
        ) : (
         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z"/>
          </svg>
        )}
      </div>
      
      <div className="results-container">
        {messages.map((msg, index) => (
          <div key={index} className={`message-block ${msg.sender}-message`}>
            <Markdown rehypePlugins={[rehypeHighlight]}>{msg.content}</Markdown>
          </div>
        ))}
        {loading && (
          <div className="message-block ai-message">
            <TypingLoader />
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="input-bar-container">
        <Editor
          value={code}
          onValueChange={setCode}
          highlight={code => prism.highlight(code, prism.languages.javascript, 'javascript')}
          padding={10}
          className="code-textarea"
          placeholder="Ask anything"
          onKeyDown={handleKeyDown}
        />
        <button className="ask-button" onClick={handleReviewCode} disabled={loading || !code.trim()}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-up" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5"/>
          </svg>
        </button>
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}

export default App;