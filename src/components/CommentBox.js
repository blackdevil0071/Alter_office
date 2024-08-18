import React, { useState, useRef } from 'react';
import { FiPaperclip } from "react-icons/fi";
import { storage } from '../Firebase';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import './CommentBox.css';

const CommentBox = ({ onPostComment }) => {
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
        const storageRef = ref(storage, `attachments/${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
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
    
    onPostComment(messageWithImage, attachmentURL);
    setMessage('');
    setAttachmentURL(null);
    textareaRef.current.innerHTML = '';
  };

  return (
    <div className="comment-box">
      <div
        className="text-area"
        contentEditable
        ref={textareaRef}
        onInput={handleMessageChange}
        placeholder="Type your comment here..."
        suppressContentEditableWarning={true}
      />
      <div className="toolbar">
        <button className="format" onClick={() => handleFormat('bold')}>B</button>
        <button className="format" onClick={() => handleFormat('italic')}>I</button>
        <button className="format" onClick={() => handleFormat('underline')}>U</button>
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
      <div className="comment-footer">
        <span className="char-count">{message.length}/{characterLimit}</span>
        <button className="send-button" onClick={handlePost}>Send</button>
      </div>
      {attachmentURL && (
        <div className="attachment-preview">
          <img src={attachmentURL} alt="Attachment preview" />
        </div>
      )}
    </div>
  );
};

export default CommentBox;
