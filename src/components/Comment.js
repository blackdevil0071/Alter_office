import React, { useState, useRef, useEffect } from "react";
import "./Comment.css";
import CommentInput from "./CommentInput";


function Comment({ name, text, time, profilePic, onReply, replies }) {
  const [isReplying, setIsReplying] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const commentRef = useRef(null);

  useEffect(() => {
    if (commentRef.current) {
      setIsOverflowing(commentRef.current.scrollHeight > commentRef.current.clientHeight);
    }
  }, [text]);

  const handleReplyClick = () => {
    setIsReplying(true);
  };

  const handleCancelReply = () => {
    setIsReplying(false);
  };

  const handleSendReply = (replyText) => {
    onReply(replyText);
    setIsReplying(false); // Close the reply input after sending
  };

  const toggleShowMore = () => {
    setShowMore(!showMore);
  };

  const handleLike = () => {
    setLikes(likes + 1);
  };

  const handleDislike = () => {
    setDislikes(dislikes + 1);
  };

  const formattedTime = () => {
    const diff = Math.floor((Date.now() - new Date(time).getTime()) / 1000);
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  const commentText = showMore || !isOverflowing ? text : `${text.slice(0, 300)}...`;

  return (
    <div className="comment-container">
      <div className="comment-header">
        <img src={profilePic} alt="Avatar" className="comment-avatar" />
        <div className="comment-info">
          <div className="user-name">{name}</div>
        </div>
      </div>
      <div className="comment-text" ref={commentRef}>
        {commentText}
        {isOverflowing && (
          <button className="show-more" onClick={toggleShowMore}>
            {showMore ? "Show less" : "Show more"}
          </button>
        )}
      </div>
      <div className="comment-actions">
        <button className="action-button" onClick={handleLike}>
          👍 {likes}
        </button>
        <button className="action-button" onClick={handleDislike}>
          👎 {dislikes}
        </button>
        <button className="action-button" onClick={handleReplyClick}>
          Reply
        </button>
        <span>|</span>
        <div className="comment-time">{formattedTime()}</div>
      </div>
      {isReplying && (
        <CommentInput
          onCancel={handleCancelReply}
          onSend={handleSendReply}
        />
      )}
      <div className="replies">
        {replies && replies.map((reply, index) => (
          <Comment 
            key={index} 
            name={reply.name} 
            text={reply.text} 
            time={reply.time} 
            profilePic={reply.profilePic} 
            onReply={() => {}} 
          />
        ))}
      </div>
    </div>
  );
}

export default Comment;
