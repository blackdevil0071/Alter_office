import React, { useState, useRef } from 'react';
import { FiPaperclip } from "react-icons/fi";
import './CommentInput.css';

const CommentInput = ({ onSend, onCancel }) => {
  const [message, setMessage] = useState('');
  const [attachmentURL, setAttachmentURL] = useState(null);
  const characterLimit = 250;
  const textareaRef = useRef(null);

  const handleMessageChange = (e) => {
    const text = e.target.innerHTML;
    if (text.length <= characterLimit) {
      setMessage(text);
    }
  };

  const handleFormat = (command) => {
    document.execCommand(command, false, null);
    textareaRef.current.focus();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const url = URL.createObjectURL(file); // For preview purposes
        setAttachmentURL(url);
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
  };

  const handlePost = () => {
    const messageWithImage = attachmentURL 
      ? `${message}<br/><img src="${attachmentURL}" alt="attachment" class="comment-image"/>` 
      : message;
    
    onSend(messageWithImage, attachmentURL);
    setMessage('');
    setAttachmentURL(null);
    textareaRef.current.innerHTML = '';
  };

  return (
    <div className="comment-input-container">
      <div
        className="text-area"
        contentEditable
        ref={textareaRef}
        onInput={handleMessageChange}
        placeholder="Type your comment here..."
        suppressContentEditableWarning={true}
      />
      <div className="comment-input-toolbar">
        <button onClick={() => handleFormat('bold')}><strong>B</strong></button>
        <button onClick={() => handleFormat('italic')}><em>I</em></button>
        <button onClick={() => handleFormat('underline')}><u>U</u></button>
        <button onClick={() => {
          const url = prompt("Enter the URL:");
          if (url) {
            document.execCommand('createLink', false, url);
            textareaRef.current.focus();
          }
        }}>Link</button>
        <label className="attachment-icon" aria-label="attachment">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <FiPaperclip />
        </label>

      </div>
      <div className="comment-input-footer">
        <span className="char-count">{message.length}/{characterLimit}</span>
        <button className="cancel-button" onClick={onCancel}>Cancel</button>
        <button className="send-button" onClick={handlePost}>
          Send
        </button>
      </div>
      {attachmentURL && (
        <div className="attachment-preview">
          <img src={attachmentURL} alt="Attachment preview" />
        </div>
      )}
    </div>
  );
};

export default CommentInput;
