import React from "react";
import "../index.css";

const CommentsHeader = ({ commentCount, onSortChange }) => {
  return (
    <div className="comment-section-container">
      <div className="title">Comments ({commentCount})</div>
      <div className="sorting-buttons">
        <button className="sort-button" onClick={() => onSortChange('latest')}>Latest</button>
        <button className="sort-button" onClick={() => onSortChange('popularity')}>Popular</button>
      </div>
    </div>
  );
};

export default CommentsHeader;
