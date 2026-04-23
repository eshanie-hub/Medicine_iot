import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import chatbot from '../assets/Chatbot.png';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'model', text: 'Hi! I am Mediport chatbot. How can I assist you today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            scrollRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen]);

    // Prevent body scroll when chat is open on mobile
    useEffect(() => {
        const isMobile = window.innerWidth <= 480;
        if (isMobile) {
            document.body.style.overflow = isOpen ? 'hidden' : '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:5000/api/chat', { message: input });
            setMessages(prev => [...prev, { role: 'model', text: response.data.reply }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'model', text: "Server error. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <style>
                {`
                .chatbot-wrapper {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    z-index: 1000;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }

                .chatbot-toggle-btn {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background-color: #4485d1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                    transition: transform 0.2s ease;
                }

                .chatbot-toggle-btn img {
                    width: 65%;
                    height: 65%;
                    object-fit: contain;
                }

                .chatbot-toggle-btn:hover {
                    transform: scale(1.05);
                }

                /* Desktop chat window */
                .chatbot-container {
                    display: flex;
                    flex-direction: column;
                    height: 550px;
                    width: 350px;
                    border-radius: 20px;
                    background-color: #f0f4f9;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
                    overflow: hidden;
                    animation: slideIn 0.3s ease-out;
                }

                @keyframes slideIn {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                @keyframes slideUp {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                .chatbot-header {
                    background-color: #4485d1;
                    padding: 15px;
                    color: white;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    cursor: pointer;
                    flex-shrink: 0;
                }

                .chatbot-header-left {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .chatbot-header span {
                    font-size: 15px;
                    font-weight: 600;
                }

                .close-btn {
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    cursor: pointer;
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    line-height: 1;
                    transition: background 0.2s;
                    flex-shrink: 0;
                }

                .close-btn:hover {
                    background: rgba(255,255,255,0.35);
                }

                .bot-icon-circle {
                    background: white;
                    border-radius: 50%;
                    width: 35px;
                    height: 35px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    flex-shrink: 0;
                }

                .bot-icon-circle img {
                    width: 70%;
                    height: 70%;
                    object-fit: contain;
                }

                .message-area {
                    flex: 1;
                    padding: 20px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    -webkit-overflow-scrolling: touch;
                }

                .message {
                    max-width: 85%;
                    padding: 12px 16px;
                    font-size: 14px;
                    line-height: 1.5;
                    word-break: break-word;
                }

                .message.model {
                    align-self: flex-start;
                    background-color: #b4d4ff;
                    color: #333;
                    border-radius: 18px 18px 18px 0;
                }

                .message.user {
                    align-self: flex-end;
                    background-color: #ffffff;
                    color: #444;
                    border-radius: 18px 18px 0 18px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
                }

                .input-container {
                    padding: 10px 15px;
                    background: white;
                    margin: 0 15px 15px 15px;
                    border-radius: 30px;
                    display: flex;
                    align-items: center;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                    flex-shrink: 0;
                }

                .chat-input {
                    flex: 1;
                    border: none;
                    outline: none;
                    font-size: 14px;
                    padding: 5px;
                    background: transparent;
                    min-width: 0;
                }

                .send-button {
                    background: none;
                    border: none;
                    color: #4485d1;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    padding: 4px;
                    flex-shrink: 0;
                }

                .send-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .loading-indicator {
                    font-size: 12px;
                    color: #4485d1;
                    font-style: italic;
                    margin-left: 5px;
                }

                /* Mobile styles — full screen takeover */
                @media (max-width: 480px) {
                    .chatbot-wrapper {
                        bottom: 16px;
                        right: 16px;
                    }

                    .chatbot-container {
                        position: fixed;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        width: 100%;
                        height: 100dvh; /* dynamic viewport height — handles browser chrome */
                        height: 100vh; /* fallback */
                        border-radius: 0;
                        animation: slideUp 0.3s ease-out;
                    }

                    .chatbot-header {
                        padding: 16px 16px;
                        padding-top: max(16px, env(safe-area-inset-top));
                    }

                    .message-area {
                        padding: 16px;
                        gap: 12px;
                    }

                    .message {
                        font-size: 15px;
                        max-width: 90%;
                        padding: 10px 14px;
                    }

                    .input-container {
                        margin: 0 12px;
                        margin-bottom: max(12px, env(safe-area-inset-bottom));
                        padding: 8px 12px;
                    }

                    .chat-input {
                        font-size: 16px; /* prevents iOS zoom on focus */
                    }

                    .close-btn {
                        width: 36px;
                        height: 36px;
                        font-size: 20px;
                    }
                }

                /* Small phones */
                @media (max-width: 360px) {
                    .chatbot-header span {
                        font-size: 14px;
                    }

                    .message {
                        font-size: 14px;
                    }
                }
                `}
            </style>

            <div className="chatbot-wrapper">
                {!isOpen ? (
                    <div className="chatbot-toggle-btn" onClick={() => setIsOpen(true)}>
                        <img src={chatbot} alt="Open Chat" />
                    </div>
                ) : (
                    <div className="chatbot-container">
                        <div className="chatbot-header">
                            <div className="chatbot-header-left">
                                <div className="bot-icon-circle">
                                    <img src={chatbot} alt="Bot Icon" />
                                </div>
                                <span>Mediport chatbot</span>
                            </div>
                            <button
                                className="close-btn"
                                onClick={() => setIsOpen(false)}
                                aria-label="Close chat"
                            >
                                ×
                            </button>
                        </div>

                        <div className="message-area">
                            {messages.map((msg, index) => (
                                <div key={index} className={`message ${msg.role}`}>
                                    {msg.text}
                                </div>
                            ))}
                            {isLoading && <div className="loading-indicator">Mediport is checking logs...</div>}
                            <div ref={scrollRef} />
                        </div>

                        <div className="input-container">
                            <form onSubmit={handleSendMessage} style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                                <input
                                    className="chat-input"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask Mediport a question"
                                    disabled={isLoading}
                                />
                                <button type="submit" className="send-button" disabled={isLoading}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" />
                                    </svg>
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Chatbot;