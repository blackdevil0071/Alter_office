import React, { useState, useRef } from "react";
import "./CommentInput.css";

const CommentInput = ({ onSend, onCancel }) => {
  const [commentText, setCommentText] = useState("");
  const [attachedFile, setAttachedFile] = useState(null);
  const [taggedUsers, setTaggedUsers] = useState([]);
  const characterLimit = 250;
  const textareaRef = useRef(null);

  const handleInputChange = (e) => {
    if (e.target.value.length <= characterLimit) {
      setCommentText(e.target.value);
    }
  };

  const handleAttachFile = (e) => {
    setAttachedFile(e.target.files[0]);
  };

  const applyFormatting = (prefix, suffix) => {
    const textarea = textareaRef.current;
    const { selectionStart, selectionEnd } = textarea;
    const before = commentText.substring(0, selectionStart);
    const selected = commentText.substring(selectionStart, selectionEnd);
    const after = commentText.substring(selectionEnd);
    
    setCommentText(`${before}${prefix}${selected}${suffix}${after}`);
    
    // Set cursor position after the formatting
    textarea.selectionStart = textarea.selectionEnd = selectionStart + prefix.length + selected.length + suffix.length;
  };

  const handleBold = () => applyFormatting("**", "**");
  const handleItalic = () => applyFormatting("_", "_");
  const handleUnderline = () => applyFormatting("__", "__");
  const handleHyperlink = () => {
    const url = prompt("Enter the URL:");
    if (url) {
      applyFormatting(`[${getSelectedText()}](${url})`, "");
    }
  };

  const handleTagUser = (user) => {
    setTaggedUsers([...taggedUsers, user]);
    setCommentText(commentText + ` @${user} `);
  };

  const handleSend = () => {
    if (commentText.trim()) {
      onSend(commentText, attachedFile, taggedUsers);
      setCommentText("");
      setAttachedFile(null);
      setTaggedUsers([]);
    }
  };

  const getSelectedText = () => {
    const textarea = textareaRef.current;
    const { selectionStart, selectionEnd } = textarea;
    return commentText.substring(selectionStart, selectionEnd);
  };

  const openFileDialog = () => {
    document.getElementById("file-upload").click();
  };

  return (
    <div className="comment-input-container">
      <textarea
        ref={textareaRef}
        className="comment-input-textarea"
        placeholder="Type your comment here..."
        value={commentText}
        onChange={handleInputChange}
      />
      <div className="comment-input-toolbar">
        <button onClick={handleBold}><strong>B</strong></button>
        <button onClick={handleItalic}><em>I</em></button>
        <button onClick={handleUnderline}><u>U</u></button>
        
      </div>
      <div className="comment-input-footer">
        <span className="char-count">{commentText.length}/{characterLimit}</span>
        <div className="comment-input-buttons">

        <button className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
                    <button className="send-button" onClick={handleSend}>
            Send
          </button>

        </div>
      </div>
    </div>
  );
};

export default CommentInput;
