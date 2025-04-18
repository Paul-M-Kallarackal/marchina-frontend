import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import mermaid from 'mermaid';
import axios from 'axios';
import DownloadIcon from '@mui/icons-material/Download';
import MicIcon from '@mui/icons-material/Mic';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CodeIcon from '@mui/icons-material/Code';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import InfoIcon from '@mui/icons-material/Info';

const API_URL = process.env.REACT_APP_API_URL || 'https://marchina-init.calmmoss-a81a16c4.eastus.azurecontainerapps.io/api/diagrams/flowchart';

const Dashboard = () => {
  const [diagram, setDiagram] = useState('');
  const [svg, setSvg] = useState('');
  const [requirement, setRequirement] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState('diagram'); // 'diagram' or 'code'

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

  const handleDownload = () => {
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'diagram.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(diagram);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Marchina AI
            </h1>
            <p className="text-xl text-gray-600">
              Transform your ideas into professional system designs
            </p>
          </motion.div>
          <Link
            to="/use-cases"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            <InfoIcon className="w-5 h-5 mr-2" />
            Learn More
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Describe Your System</h2>
              <div className="space-y-4">
                <textarea
                  value={requirement}
                  onChange={(e) => setRequirement(e.target.value)}
                  placeholder="Example: 'I need a system design for an e-commerce platform with user authentication, product catalog, and payment processing...'"
                  className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleSubmit()}
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Analyzing & Generating...
                      </span>
                    ) : (
                      'Generate System Design'
                    )}
                  </button>
                  <button
                    onClick={handleVoiceInput}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    title="Voice Input"
                  >
                    <MicIcon className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('code')}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors duration-200 ${
                      viewMode === 'code' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <CodeIcon className="w-4 h-4" />
                    <span>Mermaid Code</span>
                  </button>
                  <button
                    onClick={() => setViewMode('diagram')}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors duration-200 ${
                      viewMode === 'diagram' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <AccountTreeIcon className="w-4 h-4" />
                    <span>System Diagram</span>
                  </button>
                </div>
                {viewMode === 'code' && (
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                  >
                    {copied ? (
                      <>
                        <CheckCircleIcon className="w-4 h-4 text-green-500" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <ContentCopyIcon className="w-4 h-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                )}
                {viewMode === 'diagram' && (
                  <button
                    onClick={handleDownload}
                    disabled={!svg}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <DownloadIcon className="w-4 h-4" />
                    <span>Download SVG</span>
                  </button>
                )}
              </div>
              
              <AnimatePresence mode="wait">
                {viewMode === 'code' ? (
                  <motion.div
                    key="code"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-[500px]"
                  >
                    <textarea
                      value={diagram}
                      onChange={(e) => setDiagram(e.target.value)}
                      className="w-full h-full font-mono text-sm px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="diagram"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-[500px] flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      </div>
                    ) : svg ? (
                      <div
                        className="w-full h-full flex items-center justify-center p-4"
                        dangerouslySetInnerHTML={{ __html: svg }}
                      />
                    ) : (
                      <div className="text-gray-400 text-center">
                        <AccountTreeIcon className="w-12 h-12 mx-auto mb-4" />
                        <p>Your system diagram will appear here</p>
                        <p className="text-sm mt-2">Describe your system above to generate a diagram</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600"
          >
            {error}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 