import React, { useState, useRef, useEffect } from "react";
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../Firebase";
import "./Comment.css";
import CommentInput from "./CommentInput";



function Comment({ id, name, text, time, profilePic, onReply, replies }) {
  const [isReplying, setIsReplying] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [reactions, setReactions] = useState({});
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const emojiList = ["😀", "❤️", "👍", "😢", "😠"];
  const commentRef = useRef(null);
  const auth = getAuth();

  useEffect(() => {
    if (commentRef.current) {
      setIsOverflowing(commentRef.current.scrollHeight > commentRef.current.clientHeight);
    }
  }, [text]);

  useEffect(() => {
    const fetchReactions = async () => {
      try {
        const commentDoc = await getDoc(doc(db, "comments", id));
        if (commentDoc.exists()) {
          setReactions(commentDoc.data().reactions || {});
          const userReaction = commentDoc.data().userReactions?.[auth.currentUser?.uid] || null;
          setSelectedEmoji(userReaction);
        }
      } catch (error) {
        console.error("Error fetching reactions: ", error);
      }
    };

    fetchReactions();
  }, [id, auth.currentUser?.uid]);

  const handleReplyClick = () => setIsReplying(true);
  const handleCancelReply = () => setIsReplying(false);
  const handleSendReply = (replyText) => {
    onReply(id, replyText);
    setIsReplying(false);
  };

  const toggleShowMore = () => setShowMore(prev => !prev);
  const handleEmojiClick = async (emoji) => {
    if (!auth.currentUser) return;

    const userReaction = selectedEmoji === emoji;
    const reactionUpdate = userReaction ? arrayRemove(emoji) : arrayUnion(emoji);

    try {
      await updateDoc(doc(db, "comments", id), {
        [`reactions.${emoji}`]: reactionUpdate,
        [`userReactions.${auth.currentUser.uid}`]: userReaction ? "" : emoji
      });

      setReactions(prev => ({
        ...prev,
        [emoji]: userReaction ? (prev[emoji] || 0) - 1 : (prev[emoji] || 0) + 1
      }));
      setSelectedEmoji(userReaction ? null : emoji);
      setShowEmojiPicker(false);
    } catch (error) {
      console.error("Error updating reaction: ", error);
    }
  };

  const toggleEmojiPicker = () => setShowEmojiPicker(prev => !prev);

  const formattedTime = () => {
    const commentDate = time.toDate ? time.toDate() : new Date(time);
    const diff = Math.floor((Date.now() - commentDate.getTime()) / 1000);
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
      <div className="comment-text" ref={commentRef} dangerouslySetInnerHTML={{ __html: commentText }} />
      {isOverflowing && (
        <button className="show-more" onClick={toggleShowMore}>
          {showMore ? "Show less" : "Show more"}
        </button>
      )}
      <div className="comment-actions">
        <div className="emoji-container">
          <button className="emoji-button" onClick={toggleEmojiPicker}>
            {selectedEmoji ? selectedEmoji : "😊"}
          </button>
          {showEmojiPicker && (
            <div className="emoji-picker">
              {emojiList.map(emoji => (
                <button
                  key={emoji}
                  className={`emoji-option ${selectedEmoji === emoji ? 'selected' : ''}`}
                  onClick={() => handleEmojiClick(emoji)}
                >
                  {emoji} {reactions[emoji] || 0}
                </button>
              ))}
            </div>
          )}
        </div>
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
            id={reply.id}
            name={reply.name} 
            text={reply.text} 
            time={reply.time} 
            profilePic={reply.profilePic} 
            replies={reply.replies}
            onReply={() => {}} 
          />
        ))}
      </div>
    </div>
  );
}

export default Comment;
