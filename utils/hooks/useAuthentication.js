import {useState,useEffect} from 'react';
import { getAuth, onAuthStateChanged} from 'firebase/auth';
import { auth } from '../../firebase-config';

export function useAuthentication() {
  const [user, setUser] = useState('');

  useEffect(() => {
    const unsubscribeFromAuthStatusChanged = onAuthStateChanged(auth, (user) => {
      user ? setUser(user): setUser(undefined);
      return unsubscribeFromAuthStatusChanged;
    });
  }, []);
  return {user};
} 