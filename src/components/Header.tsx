import Link from "next/link";
import SignIn from "./SignIn";
export default function Header() {
  return (
    <header className="flex justify-between py-2 px-5 bg-orange-100 items-center">
      <Link href="/">
        <h1 className="font-semibold">English Skills App</h1>
      </Link>
      <SignIn />
    </header>
  );
}
