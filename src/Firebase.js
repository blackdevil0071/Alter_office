import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, doc, updateDoc, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB_3V5jWu5ecK4GRMYhSusom5eLTs2o-Z8",
  authDomain: "signin-3e064.firebaseapp.com",
  projectId: "signin-3e064",
  storageBucket: "signin-3e064.appspot.com",
  messagingSenderId: "310863754628",
  appId: "1:310863754628:web:4472cbd0cf5f5c562cd9d1",
  measurementId: "G-ZT3LC3B75F"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    localStorage.setItem('name', user.displayName);
    localStorage.setItem('email', user.email);
    localStorage.setItem('profilePic', user.photoURL);
    return user;
  } catch (error) {
    console.error("Error during sign-in:", error);
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem('name');
    localStorage.removeItem('email');
    localStorage.removeItem('profilePic');
  } catch (error) {
    console.error("Error during sign-out:", error);
  }
};

export const postComment = async (commentText, attachmentFile) => {
  try {
    const user = {
      name: localStorage.getItem('name'),
      email: localStorage.getItem('email'),
      profilePic: localStorage.getItem('profilePic')
    };

    let attachmentURL = null;
    if (attachmentFile) {
      const storageRef = ref(storage, `attachments/${attachmentFile.name}`);
      await uploadBytes(storageRef, attachmentFile);
      attachmentURL = await getDownloadURL(storageRef);
    }

    await addDoc(collection(db, "comments"), {
      name: user.name,
      profilePic: user.profilePic,
      text: commentText,
      attachment: attachmentURL || null,
      time: new Date(),
      reactions: {},
      replies: []
    });
  } catch (error) {
    console.error("Error posting comment:", error);
  }
};

export const fetchComments = async () => {
  try {
    const q = query(collection(db, "comments"), orderBy("time", "desc"));
    const querySnapshot = await getDocs(q);
    const comments = [];
    querySnapshot.forEach((doc) => {
      comments.push({ id: doc.id, ...doc.data() });
    });
    return comments;
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
};

export const fetchCommentById = async (commentId) => {
  try {
    const commentRef = doc(db, "comments", commentId);
    const docSnap = await getDoc(commentRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      console.error("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching comment:", error);
    return null;
  }
};

export const addReply = async (commentId, replyText) => {
  if (!replyText || typeof replyText !== 'string') {
    console.error("Invalid reply text");
    return;
  }

  try {
    const repliesRef = collection(db, "comments", commentId, "replies");
    await addDoc(repliesRef, { text: replyText, timestamp: new Date() });
  } catch (error) {
    console.error("Error adding reply:", error);
  }
};

export const fetchReplies = async (parentCommentId) => {
  try {
    const repliesCollection = collection(db, "comments", parentCommentId, "replies");
    const q = query(repliesCollection, orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);
    const replies = [];
    querySnapshot.forEach((doc) => {
      replies.push({ id: doc.id, ...doc.data() });
    });
    return replies;
  } catch (error) {
    console.error("Error fetching replies:", error);
    return [];
  }
};

export const updateCommentReactions = async (commentId, reactions) => {
  try {
    const commentRef = doc(db, "comments", commentId);
    await updateDoc(commentRef, { reactions });
  } catch (error) {
    console.error("Error updating comment reactions:", error);
  }
};

export const updateUserReaction = async (commentId, userReaction) => {
  try {
    const userReactionRef = doc(db, "userReactions", commentId);
    await setDoc(userReactionRef, { reaction: userReaction });
  } catch (error) {
    console.error("Error updating user reaction:", error);
  }
};

export const deleteComment = async (commentId) => {
  try {
    await deleteDoc(doc(db, "comments", commentId));
  } catch (error) {
    console.error("Error deleting comment:", error);
  }
};

export const deleteReply = async (parentCommentId, replyId) => {
  try {
    await deleteDoc(doc(db, "comments", parentCommentId, "replies", replyId));
  } catch (error) {
    console.error("Error deleting reply:", error);
  }
};

export { auth, provider, db, storage, signInWithPopup, signOut };
