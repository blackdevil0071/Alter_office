import React, { useState, useEffect } from "react";
import "../index.css";
import googleLogo from "../assets/ellipse-3.svg";
import { signInWithGoogle, auth } from "../Firebase";
import Header from "./Header";
import CommentBox from "./CommentBox";
import Comment from "./Comment";
import CommentsHeader from "./CommentsHeader";
import Toast from "./Toast"; // Import the Toast component

const SignIn = () => {
  const [user, setUser] = useState(null);
  const [comments, setComments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState("latest");
  const [toastMessage, setToastMessage] = useState(null); // Toast message state

  const commentsPerPage = 8;

  const sortedComments = comments.sort((a, b) => {
    if (sortOption === "latest") {
      return new Date(b.time) - new Date(a.time);
    } else if (sortOption === "popularity") {
      const bPopularity = (b.likes || 0) - (b.dislikes || 0);
      const aPopularity = (a.likes || 0) - (a.dislikes || 0);
      return bPopularity - aPopularity;
    }
    return 0;
  });

  const paginatedComments = sortedComments.slice(
    (currentPage - 1) * commentsPerPage,
    currentPage * commentsPerPage
  );

  useEffect(() => {
    const storedUser = {
      name: localStorage.getItem("name"),
      email: localStorage.getItem("email"),
      profilePic: localStorage.getItem("profilePic"),
    };
    if (storedUser.name) {
      setUser(storedUser);
    }
    fetchComments();
  }, []);

  const fetchComments = () => {
    const storedComments = JSON.parse(localStorage.getItem("comments")) || [];
    setComments(storedComments);
  };

  const handleSignIn = async () => {
    try {
      const userData = await signInWithGoogle();
      setUser(userData);
      localStorage.setItem("name", userData.name);
      localStorage.setItem("email", userData.email);
      localStorage.setItem("profilePic", userData.profilePic);
    } catch (error) {
      setToastMessage("Failed to sign in. Please try again."); // Show failure toast message
    }
  };

  const handleLogout = () => {
    auth.signOut().then(() => {
      setUser(null);
      localStorage.removeItem("name");
      localStorage.removeItem("email");
      localStorage.removeItem("profilePic");
    });
  };

  const handlePostComment = (text) => {
    if (!text.trim()) {
      setToastMessage("Comment cannot be empty!"); // Show empty state toast message
      return;
    }

    const newComment = {
      id: Date.now(),
      name: user ? user.name : "Anonymous",
      text,
      time: new Date().toISOString(),
      profilePic: user ? user.profilePic : "",
      replies: [],
      likes: 0,
      dislikes: 0,
    };

    const updatedComments = [newComment, ...comments];
    setComments(updatedComments);
    localStorage.setItem("comments", JSON.stringify(updatedComments));
    setToastMessage("Comment posted successfully!"); // Show success toast message
  };

  const handleReply = (parentCommentId, replyText) => {
    const updatedComments = comments.map((comment) => {
      if (comment.id === parentCommentId) {
        return {
          ...comment,
          replies: [
            ...(comment.replies || []),
            {
              id: Date.now(),
              text: replyText,
              name: user ? user.name : "Anonymous",
              time: new Date().toLocaleTimeString(),
              profilePic: user ? user.profilePic : "",
            },
          ],
        };
      }
      return comment;
    });

    setComments(updatedComments);
    localStorage.setItem("comments", JSON.stringify(updatedComments));
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
              onLogout={handleLogout}
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
            onPostComment={
              user ? handlePostComment : () => { alert("Please sign in to post a comment"); }
            }
          />
          <div className="comment-section">
            {paginatedComments.map((comment, index) => (
              <Comment
                key={index}
                name={comment.name}
                text={comment.text}
                time={comment.time}
                profilePic={comment.profilePic}
                replies={comment.replies}
                onReply={(replyText) => handleReply(comment.id, replyText)}
              />
            ))}
          </div>
          <div className="pagination-controls">
            {Array.from({
              length: Math.ceil(comments.length / commentsPerPage),
            }).map((_, index) => (
              <button
                key={index}
                onClick={() => handlePageChange(index + 1)}
                className={`pagination-button ${
                  currentPage === index + 1 ? "active" : ""
                }`}
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
