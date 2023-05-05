import Link from "next/link"

export default function Home() {
  return (
    <main className="flex flex-col w-screen h-screen bg-github-slate-800">
      <div className="flex flex-col items-center justify-center flex-1">
        <h1 className="text-6xl font-bold text-white">GitHUD</h1>
        <p className="text-3xl font-medium text-white tracking-tight">
          Your heads up display for GitHub.
        </p>
        <Link
          className="text-2xl text-neutral-300 font-medium"
          href="/view"
        >
          Get started →
        </Link>
      </div>
    </main>
  )
}