"use client";
import { useState, useEffect } from "react";
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { auth, provider } from "@/lib/firebaseConfig";
import Link from "next/link";

export default function SignIn() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        setUser(result.user);
      })
      .catch((error) => {
        console.error("Error during sign-in:", error.message);
      });
  };

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        setUser(null);
      })
      .catch((error) => {
        console.error("Error during sign-out:", error.message);
      });
  };

  return (
    <div>
      {user ? (
        <div className="flex items-center space-x-2">
          {user.photoURL && (
            <Image
              src={user.photoURL}
              alt="User Avatar"
              className="w-10 h-10 rounded-full"
              width={40}
              height={40}
            />
          )}
          <span>{user.displayName}</span>
          {user && (
            <Link href="/history">
              <button className="text-white font-semibold bg-orange-400 hover:bg-orange-500 px-4 py-2 rounded">
                History
              </button>
            </Link>
          )}
          <Button
            variant="secondary"
            className="text-white font-semibold bg-orange-400 hover:bg-orange-500"
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        </div>
      ) : (
        <Button
          variant="secondary"
          className="text-white font-semibold bg-orange-400 hover:bg-orange-500"
          onClick={handleSignIn}
        >
          Sign In
        </Button>
      )}
    </div>
  );
}
