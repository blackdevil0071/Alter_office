import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB_3V5jWu5ecK4GRMYhSusom5eLTs2o-Z8",
  authDomain: "signin-3e064.firebaseapp.com",
  projectId: "signin-3e064",
  storageBucket: "signin-3e064.appspot.com",
  messagingSenderId: "310863754628",
  appId: "1:310863754628:web:4472cbd0cf5f5c562cd9d1",
  measurementId: "G-ZT3LC3B75F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, provider, db };

export const signInWithGoogle = () => {
  return signInWithPopup(auth, provider).then((result) => {
    const user = result.user;
    const userData = {
      name: user.displayName,
      email: user.email,
      profilePic: user.photoURL
    };
    localStorage.setItem('name', userData.name);
    localStorage.setItem('email', userData.email);
    localStorage.setItem('profilePic', userData.profilePic);
    return userData;
  }).catch((error) => {
    console.error("Error during sign-in:", error);
    throw error;
  });
};

export const signOutUser = () => {
  return signOut(auth).then(() => {
    localStorage.removeItem('name');
    localStorage.removeItem('email');
    localStorage.removeItem('profilePic');
  }).catch((error) => {
    console.error("Error during sign-out:", error);
  });
};

export const postComment = async (commentText) => {
  try {
    const user = {
      name: localStorage.getItem('name'),
      email: localStorage.getItem('email'),
      profilePic: localStorage.getItem('profilePic')
    };
    await addDoc(collection(db, "comments"), {
      name: user.name,
      profilePic: user.profilePic,
      text: commentText,
      time: new Date()
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
      comments.push(doc.data());
    });
    return comments;
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
};
