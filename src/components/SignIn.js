import React, { useState, useEffect } from "react";
import "../index.css";
import googleLogo from "../assets/ellipse-3.svg";
import Header from "./Header";
import CommentBox from "./CommentBox";
import Comment from "./Comment";
import CommentsHeader from "./CommentsHeader";
import Toast from "./Toast";
import { signInWithGoogle, signOutUser, fetchComments, postComment, addReply, updateCommentReactions } from "../Firebase";

const SignIn = () => {
  const [user, setUser] = useState(null);
  const [comments, setComments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState("latest");
  const [toastMessage, setToastMessage] = useState(null);
  const [replyingToCommentId, setReplyingToCommentId] = useState(null);

  const commentsPerPage = 8;

  const sortedComments = comments.sort((a, b) => {
    if (sortOption === "latest") {
      return new Date(b.time) - new Date(a.time);
    } else if (sortOption === "popularity") {
      const aPopularity = Object.values(a.reactions || {}).reduce((sum, count) => sum + count, 0);
      const bPopularity = Object.values(b.reactions || {}).reduce((sum, count) => sum + count, 0);
      return bPopularity - aPopularity;
    }
    return 0;
  });

  const paginatedComments = sortedComments.slice(
    (currentPage - 1) * commentsPerPage,
    currentPage * commentsPerPage
  );

  const handleReact = async (commentId, emoji, delta) => {
    const updatedComments = comments.map((comment) => {
      if (comment.id === commentId) {
        const updatedReactions = { ...comment.reactions };
        if (emoji) {
          updatedReactions[emoji] = (updatedReactions[emoji] || 0) + delta;
        } else {
          Object.keys(updatedReactions).forEach((key) => {
            if (updatedReactions[key] > 0) {
              updatedReactions[key] -= 1;
            }
          });
        }
        return {
          ...comment,
          reactions: updatedReactions,
        };
      }

      if (comment.replies) {
        const updatedReplies = comment.replies.map((reply) => {
          if (reply.id === commentId) {
            const updatedReactions = { ...reply.reactions };
            if (emoji) {
              updatedReactions[emoji] = (updatedReactions[emoji] || 0) + delta;
            } else {
              Object.keys(updatedReactions).forEach((key) => {
                if (updatedReactions[key] > 0) {
                  updatedReactions[key] -= 1;
                }
              });
            }
            return {
              ...reply,
              reactions: updatedReactions,
            };
          }
          return reply;
        });
        return {
          ...comment,
          replies: updatedReplies,
        };
      }

      return comment;
    });

    setComments(updatedComments);

    // Update the reactions in Firestore
    try {
      await updateCommentReactions(commentId, updatedComments.find(comment => comment.id === commentId).reactions);
    } catch (error) {
      console.error("Error updating reactions in Firestore:", error);
    }
  };

  useEffect(() => {
    const storedUser = {
      name: localStorage.getItem("name"),
      email: localStorage.getItem("email"),
      profilePic: localStorage.getItem("profilePic"),
    };
    if (storedUser.name) {
      setUser(storedUser);
    }

    const fetchAndSetComments = async () => {
      const fetchedComments = await fetchComments();
      setComments(fetchedComments);
    };

    fetchAndSetComments();
  }, []);

  const handleSignIn = async () => {
    try {
      const user = await signInWithGoogle();
      setUser(user);
    } catch (error) {
      console.error("Sign-in failed:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setUser(null);
      setToastMessage("Signed out successfully");
    } catch (error) {
      console.error("Sign-out failed:", error);
    }
  };

  const handlePostComment = async (text, attachment) => {
    try {
      await postComment(text, attachment);
      const updatedComments = await fetchComments();
      setComments(updatedComments);
      setToastMessage("Comment posted successfully!");
    } catch (error) {
      console.error("Failed to post comment:", error);
    }
  };

  const handleReply = async (commentId, replyText) => {
    if (commentId && replyText) {
      try {
        await addReply(commentId, replyText);
        const updatedComments = await fetchComments();
        setComments(updatedComments);
        setToastMessage("Reply posted successfully!");
        setReplyingToCommentId(null);
      } catch (error) {
        console.error("Failed to post reply:", error);
      }
    }
  };

  const handleSortChange = (sortOption) => {
    setSortOption(sortOption);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="main-container">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      <div className="logged-in-container">
        {user ? (
          <>
            <Header
              name={user.name}
              profilePic={user.profilePic}
              onLogout={handleSignOut}
            />
          </>
        ) : (
          <div className="sign-in">
            <img src={googleLogo} alt="Google Logo" />
            <div onClick={handleSignIn} className="sign-in-text">
              Sign in with Google
            </div>
          </div>
        )}
        <div className="shadow">
          <CommentsHeader
            commentCount={comments.length}
            onSortChange={handleSortChange}
          />
          <CommentBox
            onPostComment={user ? handlePostComment : () => alert("Please sign in to post a comment")}
            replyingToCommentId={replyingToCommentId}
            setReplyingToCommentId={setReplyingToCommentId}
          />
          <div className="comment-section">
            {paginatedComments.map((comment, index) => (
              <Comment
                key={index}
                id={comment.id}
                name={comment.name}
                text={comment.text}
                time={comment.time}
                profilePic={comment.profilePic}
                replies={comment.replies}
                onReply={handleReply}
                onReact={handleReact}
                user={user}
              />
            ))}
          </div>
          <div className="pagination-controls">
            {Array.from({ length: Math.ceil(comments.length / commentsPerPage) }).map((_, index) => (
              <button
                key={index}
                onClick={() => handlePageChange(index + 1)}
                className={`pagination-button ${currentPage === index + 1 ? "active" : ""}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
