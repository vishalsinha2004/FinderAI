import { useState, useEffect, useRef } from 'react';
import Editor from "react-simple-code-editor";
import prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
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
  const scrollRef = useRef(null);

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

  if (showWelcome) {
    return (
      <div className="welcome-page">
        <div className="welcome-content"><h1>FinderAI</h1><p>Loading your AI assistant...</p></div>
      </div>
    );
  }

  return (
    <div className="app-container">
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
          onValueChange={setCode} // <-- FIX: Corrected from onValue-change to onValueChange
          highlight={code => prism.highlight(code, prism.languages.javascript, 'javascript')}
          padding={10}
          className="code-textarea"
          placeholder="Ask a question or paste code..."
          onKeyDown={handleKeyDown}
        />
        <button className="ask-button" onClick={handleReviewCode} disabled={loading || !code.trim()}>
          {/* <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg> */}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-up" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5"/>
</svg>
        </button>
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}

export default App;
