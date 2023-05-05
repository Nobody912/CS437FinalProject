import Link from "next/link";
import { useContext, useEffect, useState } from "react"
import { Octokit } from "octokit";

import { AuthContext } from "../components/AuthContext"
import AuthView from "../components/AuthView"

export default function View(props: any) {
    const [loggedIn, setLoggedIn] = useState(false)
    const [username, setUsername] = useState("")
    const [token, setToken] = useState("")

    function login() {
        setLoggedIn(true)
    }

    function logout() {
        setLoggedIn(false)
        setUsername("")
        setToken("")
    }

    async function handleSubmit(e: any) {
        e.preventDefault()

        const username = e.target.username.value
        const token = e.target.token.value

        const octokit = new Octokit({
            auth: token
        });

        let response = await octokit.request(`GET /users/${username}/repos`, {
            username: username,
            headers: {
                "X-GitHub-Api-Version": "2022-11-28"
            }
        })

        setUsername(username)
        setToken(token)
        login()
    }

    // Load env vars
    useEffect(() => {
        if (process.env.NEXT_PUBLIC_USERNAME !== "" &&
            process.env.NEXT_PUBLIC_USERNAME !== undefined &&
            process.env.NEXT_PUBLIC_TOKEN !== "" &&
            process.env.NEXT_PUBLIC_TOKEN !== undefined) {
            setUsername(process.env.NEXT_PUBLIC_USERNAME)
            setToken(process.env.NEXT_PUBLIC_TOKEN)
            login()
        }
    }, [])

    return (
        <AuthContext.Provider
            value={{ isLoggedIn: loggedIn, username: username, token: token, login: login, logout: logout }}
        >
            <main className="flex flex-col w-screen h-screen max-w-full max-h-full justify-center items-center bg-github-slate-800 overflow-hidden">
                {!loggedIn ? (
                    <div className="flex flex-col w-full h-full justify-center items-center">
                        <h1 className="text-4xl font-bold text-white mb-6">GitHUD</h1>
                        <div className="flex flex-col w-full max-w-sm items-center justify-center gap-y-8 p-6 mb-6 bg-github-slate-700 border border-1 border-white/10 rounded-xl">
                            <form onSubmit={handleSubmit} className="flex flex-col w-full gap-y-6">
                                <div className="flex flex-col gap-y-4">
                                    <span className="text-md text-white font-normal">GitHub Username</span>
                                    <input
                                        className="flex px-3 py-2 bg-github-slate-800 border-2 border-white/10 rounded-lg outline-none focus:border-blue-500 transition-all duration-150 text-white font-normal"
                                        type="text"
                                        name="username"
                                    />
                                </div>
                                <div className="flex flex-col gap-y-4">
                                    <span className="text-md text-white font-normal">Personal Access Token</span>
                                    <input
                                        className="flex px-3 py-2 bg-github-slate-800 border-2 border-white/10 rounded-lg outline-none focus:border-blue-500 transition-all duration-150 text-white font-normal"
                                        type="text"
                                        name="token"
                                    />
                                </div>
                                <button className="flex justify-center items-center px-2 py-1 border border-1 border-white/10 bg-github-green rounded-lg text-lg text-white font-medium tracking-tight">
                                    Get started
                                </button>
                            </form>
                        </div>
                        <div className="flex flex-col w-full max-w-sm items-center justify-center gap-y-8 p-4 bg-inherit border border-1 border-white/10 rounded-xl">
                            <p className="text-lg text-white font-normal">
                                Need help getting a Personal Access Token?{" "}
                                <Link
                                    href="https://github.com/settings/tokens/new?description=GitHUD&scopes=repo"
                                >
                                    <span className="text-blue-500 font-medium">Learn more →</span>
                                </Link>
                            </p>
                        </div>
                    </div>
                ) : (
                    <AuthView />
                )}
            </main>
        </AuthContext.Provider>
    )
}