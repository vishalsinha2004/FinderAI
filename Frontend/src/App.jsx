import { useState, useEffect } from 'react'
import "prismjs/themes/prism-tomorrow.css"
import Editor from "react-simple-code-editor"
import prism from "prismjs"
import Markdown from "react-markdown"
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import axios from 'axios'
import './App.css'

import { ToastContainer, toast } from 'react-toastify';

function App() {
  const [count, setCount] = useState(0)
  const [code, setCode] = useState(``)
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState(``)

  useEffect(() => {
    prism.highlightAll()
    // Set welcome message when component mounts
    setReview(`# Welcome to FinderAI...! 👋\n\nStart by writing some Code & Question in the editor and click "Search" to get an FinderAI...\n\n### Features:\n- Code analysis\n- Answer Solving\n- Best practices\n- Error detection 🚀`);
  }, [])

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
            className="review">{loading ? " Deep Search..." : (code === null ? "Write Something" : " Search ")}</div>        </div>
        <div className="right">
          <Markdown
            rehypePlugins={[rehypeHighlight]}
          >{review}</Markdown>
        </div>
      </main>
    </>
  )
}

export default App