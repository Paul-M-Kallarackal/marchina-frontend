import React, { useState, useEffect, useCallback } from 'react';
import mermaid from 'mermaid';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://marchina-init.calmmoss-a81a16c4.eastus.azurecontainerapps.io/api/diagrams/flowchart';

function App() {
  const [diagram, setDiagram] = useState('');
  const [svg, setSvg] = useState('');
  const [requirement, setRequirement] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const renderDiagram = useCallback(async () => {
    try {
      const { svg } = await mermaid.render('mermaid-diagram', diagram);
      setSvg(svg);
    } catch (error) {
      console.error('Error rendering diagram:', error);
      setError('Error rendering diagram. Please check your Mermaid syntax.');
    }
  }, [diagram]);
  
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
    });
    if (diagram) {
      renderDiagram();
    }
  }, [diagram, renderDiagram]);


  const handleVoiceInput = async () => {
    try {
      const recognition = new window.webkitSpeechRecognition();
      recognition.lang = 'en-US';
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setRequirement(transcript);
        handleSubmit(transcript);
      };
      recognition.start();
    } catch (error) {
      console.error('Error with voice recognition:', error);
      setError('Error with voice recognition. Please try again.');
    }
  };

  const handleSubmit = async (text = requirement) => {
    try {
      setIsLoading(true);
      setError('');
      const response = await axios.post(API_URL, {
        prompt: text
      });
      setDiagram(response.data.mermaidCode);
    } catch (error) {
      console.error('Error fetching diagram:', error);
      setError('Error fetching diagram. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Marchina</h1>
      <div className="controls">
        <div className="requirement-input">
          <textarea
            value={requirement}
            onChange={(e) => setRequirement(e.target.value)}
            placeholder="Enter your requirement here..."
            rows="3"
          />
          <button onClick={() => handleSubmit()}>Submit</button>
          <button onClick={handleVoiceInput}>Voice Input</button>
        </div>
      </div>
      {error && <div className="error">{error}</div>}
      {isLoading ? (
        <div className="loading">Generating diagram...</div>
      ) : (
        <div className="editor-container">
          <textarea
            value={diagram}
            onChange={(e) => setDiagram(e.target.value)}
            className="editor"
            rows="10"
            placeholder="Mermaid diagram will appear here..."
          />
          <div
            className="visualizer"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        </div>
      )}
    </div>
  );
}

export default App; 