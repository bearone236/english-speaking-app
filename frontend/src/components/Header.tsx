"use client";
import Link from "next/link";
import SignIn from "./SignIn";
import { auth } from "@/lib/firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";

export default function Header() {
  const [user] = useAuthState(auth);

  return (
    <header className="flex justify-between py-2 px-5 bg-orange-100 items-center">
      <Link href="/">
        <h1 className="font-semibold">English Skills App</h1>
      </Link>
      <nav className="flex items-center space-x-4">
        {user && (
          <Link href="/history">
            <button className="text-white font-semibold bg-orange-400 hover:bg-orange-500 px-4 py-2 rounded">
              History
            </button>
          </Link>
        )}
        <SignIn />
      </nav>
    </header>
  );
}
