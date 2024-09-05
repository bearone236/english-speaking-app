"use client";
import Link from "next/link";
import SignIn from "./SignIn";

export default function Header() {
  return (
    <header className="flex justify-between py-2 px-5 bg-orange-100 items-center">
      <Link href="/">
        <h1 className="font-semibold">English Skills App</h1>
      </Link>
      <nav className="flex items-center space-x-4">
        <SignIn />
      </nav>
    </header>
  );
}
