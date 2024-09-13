import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <main className="text-center">
        <h1 className="text-4xl font-bold mb-6">Welcome to Our App</h1>
        <p className="text-xl mb-8">
          Your one-stop solution for amazing things!
        </p>
        <div className="space-y-4">
          <Link
            href="/login"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            Login
          </Link>
          <div className="text-sm">
            <span className="mr-2">Don&apos;t have an account?</span>
            <Link href="/register" className="text-blue-500 hover:underline">
              Register here
            </Link>
          </div>
        </div>
      </main>
      <footer className="mt-8 text-center text-gray-500">
        <p>&copy; 2023 Our App. All rights reserved.</p>
      </footer>
    </div>
  );
}
