import React, { useState } from 'react';
import { FiPaperclip } from "react-icons/fi";
import './CommentBox.css';

const CommentBox = ({ onPostComment }) => {
  const [message, setMessage] = useState('Hi @Jo'); // State for the editable message
  const [attachment, setAttachment] = useState(null); // State for file attachments
  const characterLimit = 250;

  // Handle message change
  const handleMessageChange = (e) => {
    const text = e.target.value;
    if (text.length <= characterLimit) {
      setMessage(text); // Update the message text
    }
  };

  // Apply formatting to the selected text
  const handleFormat = (formatType) => {
    const textarea = document.querySelector('.text-area');
    const { selectionStart, selectionEnd } = textarea;
    const selectedText = message.substring(selectionStart, selectionEnd);

    if (selectedText) {
      let formattedText = '';
      switch (formatType) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `*${selectedText}*`;
          break;
        case 'underline':
          formattedText = `__${selectedText}__`;
          break;
        default:
          formattedText = selectedText;
      }

      setMessage(prevMessage => {
        return prevMessage.slice(0, selectionStart) + formattedText + prevMessage.slice(selectionEnd);
      });
    }
  };

  // Handle file change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachment(URL.createObjectURL(file));
    }
  };

  const handlePost = () => {
    onPostComment(message, attachment); // Pass both message and attachment
    setMessage(''); // Clear the message
    setAttachment(null); // Clear the attachment
  };

  return (
    <div className="comment-box">
      <textarea
        className="text-area"
        value={message}
        onChange={handleMessageChange}
        placeholder="Type your comment here..."
      />
      <div className="toolbar">
        <div className="formats">
          <span
            className="format"
            aria-label="bold"
            onClick={() => handleFormat('bold')}
          >
            B
          </span>
          <span
            className="format"
            aria-label="italic"
            onClick={() => handleFormat('italic')}
          >
            I
          </span>
          <span
            className="format"
            aria-label="underline"
            onClick={() => handleFormat('underline')}
          >
            U
          </span>
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
      </div>
      <div className="comment-footer">
        <span className="char-count">{message.length}/{characterLimit}</span>
        <button className="send-button" onClick={handlePost}>
          Send
        </button>
      </div>
      {attachment && (
        <div className="attachment-preview">
          <img src={attachment} alt="Attachment preview" />
        </div>
      )}
    </div>
  );
};

export default CommentBox;
