import Link from "next/link";

export default function NotFound() {
  return (
    <div className="w-screen h-screen flex flex-col gap-3 justify-center items-center darkbg">
      <h2 className="text-5xl text-rose-500 font-black">404 Not Found</h2>
      <p className="text-white">
        Go to{" "}
        <Link
          className="text-lg text-orange-400 ring-1 ring-orange-400 hover:bg-orange-700/50 bg-orange-900/50 px-4 m-2 rounded-full"
          href="/"
        >
          Home
        </Link>{" "}
        page
      </p>
    </div>
  );
}