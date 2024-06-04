import {useState,useEffect} from 'react';
import { getAuth, onAuthStateChanged} from 'firebase/auth';
import { auth } from '../../firebase-config';

export function useAuthentication() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribeFromAuthStatusChanged = onAuthStateChanged(auth, (user) => {
      user ? setUser(user) : setUser(null);
    });

    // Return cleanup function to unsubscribe from the listener
    return unsubscribeFromAuthStatusChanged;
  }, []);
  
  return {user};
} 