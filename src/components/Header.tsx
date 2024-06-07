import SignIn from "./SignIn";
export default function Header() {
  return (
    <header className="flex justify-between py-2 px-5 bg-orange-100 items-center">
      <h1 className="font-semibold">English Skills App</h1>
      <SignIn />
    </header>
  );
}
