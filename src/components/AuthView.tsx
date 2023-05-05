import { useContext, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { Octokit } from "@octokit/core";
import { OctokitResponse } from "@octokit/types";

import { GitMergeIcon, GitPullRequestIcon, IssueClosedIcon, IssueOpenedIcon, GitBranchIcon, TabExternalIcon } from "@primer/octicons-react"
import MoonLoader from "react-spinners/MoonLoader"

import { AuthContext } from "./AuthContext";

interface GenericObject {
  [key: string]: any
}

export default function AuthView() {
  const auth = useContext(AuthContext);

  const [userMenu, setUserMenu] = useState<Boolean>(false);

  const [fetch, setFetch] = useState<Boolean>(false);
  const [fetchData, setFetchData] = useState<GenericObject>({
    date: new Date(),
  });

  const [user, setUser] = useState<GenericObject>({});
  const [repos, setRepos] = useState<Array<Object>>([{}]);

  const [repo, setRepo] = useState<GenericObject>({});
  const [branch, setBranch] = useState<string>("");
  const [commit, setCommit] = useState<string>("");

  const navRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [contentHeight, setContentHeight] = useState<number>(0);

  const octo = new Octokit({
    auth: auth.token,
  });

  async function changeRepo(owner: string, repo: string, silent: Boolean = false) {
    setFetch(true);
    let newData: GenericObject = {}

    if (!silent) {
      newData.full_name = `${owner}/${repo}`
      setRepo(newData)
      setBranch("")
      setCommit("")
    }

    // Get overall info
    let response = await octo.request(`GET /repos/${owner}/${repo}`, {
      owner: owner,
      repo: repo,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })

    let response_open_issues = await octo.request(`GET /search/issues`, {
      q: `repo:${owner}/${repo}+type:issue+state:open`,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })

    let response_closed_issues = await octo.request(`GET /search/issues`, {
      q: `repo:${owner}/${repo}+type:issue+state:closed`,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })

    let response_open_pr = await octo.request(`GET /search/issues`, {
      q: `repo:${owner}/${repo}+type:pr+state:open`,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    let response_closed_pr = await octo.request(`GET /search/issues`, {
      q: `repo:${owner}/${repo}+type:pr+state:closed`,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    let response_refs: OctokitResponse<any> | void = await octo.request(`GET /repos/${owner}/${repo}/git/refs`, {
      owner: owner,
      repo: repo,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }).catch((err) => {
      if (err === "HttpError: Git Repository is empty.") {
        setFetch(false);
        return
      }
    })

    let commits: any = {}

    // get commits per ref
    if (response_refs) {
      for (let key in response_refs.data) {
        let ref = response_refs.data[key].ref
        let branch = ref.split("/").slice(-1)[0]

        // if contains pull, skip
        if (ref.includes("pull")) {
          continue
        }

        let response_commits = await octo.request(`GET /repos/${owner}/${repo}/commits`, {
          owner: owner,
          repo: repo,
          sha: branch,
          headers: {
            'X-GitHub-Api-Version': '2022-11-28'
          }
        })


        commits[branch] = response_commits.data
      }
    }


    newData = {
      ...response.data,
      "open_issues": response_open_issues.data,
      "closed_issues": response_closed_issues.data,
      "open_pr": response_open_pr.data,
      "closed_pr": response_closed_pr.data,
      "branches": response_refs?.data,
      "commits": commits
    }

    console.log("newRepoData", newData)

    // master or main ref exists, set it as default, otherwise first
    if (response_refs?.data.filter((ref: any) => ref.ref === "refs/heads/master" || ref.ref === "refs/heads/main").length > 0) {
      let branch = response_refs?.data.filter((ref: any) => ref.ref === "refs/heads/master" || ref.ref === "refs/heads/main")[0].ref.split("/").slice(-1)[0]
      changeBranch(branch)

      try {
        let commit = commits[branch][0].sha
        changeCommit(commit)
      } catch (err) {
        changeCommit("")
      }

    } else {
      let branch = response_refs?.data[0].ref.split("/").slice(-1)[0]
      changeBranch(branch)

      try {
        let commit = commits[branch][0].sha
        changeCommit(commit)
      } catch (err) {
        changeCommit("")
      }
    }

    // set view data
    setRepo(newData)
    setFetch(false);
  }

  async function updateRepo(owner: string, repo: string, silent: Boolean = false) {
    setFetch(true);
    let newData: GenericObject = {}

    if (!silent) {
      newData.full_name = `${owner}/${repo}`
      setRepo(newData)
      setBranch("")
      setCommit("")
    }

    // Get overall info
    let response = await octo.request(`GET /repos/${owner}/${repo}`, {
      owner: owner,
      repo: repo,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })

    let response_open_issues = await octo.request(`GET /search/issues`, {
      q: `repo:${owner}/${repo}+type:issue+state:open`,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })

    let response_closed_issues = await octo.request(`GET /search/issues`, {
      q: `repo:${owner}/${repo}+type:issue+state:closed`,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })

    let response_open_pr = await octo.request(`GET /search/issues`, {
      q: `repo:${owner}/${repo}+type:pr+state:open`,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    let response_closed_pr = await octo.request(`GET /search/issues`, {
      q: `repo:${owner}/${repo}+type:pr+state:closed`,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    let response_refs: OctokitResponse<any> | void = await octo.request(`GET /repos/${owner}/${repo}/git/refs`, {
      owner: owner,
      repo: repo,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }).catch((err) => {
      if (err === "HttpError: Git Repository is empty.") {
        setFetch(false);
        return
      }
    })

    let commits: any = {}

    // get commits per ref
    if (response_refs) {
      for (let key in response_refs.data) {
        let ref = response_refs.data[key].ref
        let branch = ref.split("/").slice(-1)[0]

        // if contains pull, skip
        if (ref.includes("pull")) {
          continue
        }

        let response_commits = await octo.request(`GET /repos/${owner}/${repo}/commits`, {
          owner: owner,
          repo: repo,
          sha: branch,
          headers: {
            'X-GitHub-Api-Version': '2022-11-28'
          }
        })


        commits[branch] = response_commits.data
      }
    }


    newData = {
      ...response.data,
      "open_issues": response_open_issues.data,
      "closed_issues": response_closed_issues.data,
      "open_pr": response_open_pr.data,
      "closed_pr": response_closed_pr.data,
      "branches": response_refs?.data,
      "commits": commits
    }

    console.log("newRepoData updated", newData)

    // set view data
    setRepo(newData)
    setFetch(false);
  }

  async function changeBranch(branch: string) {
    setBranch(branch)
    if (repo?.commits && repo.commits[branch] && repo.commits[branch].length > 0) {
      setCommit(repo.commits[branch][0].sha)
    }
  }

  async function changeCommit(commit: string) {
    setCommit(commit)
  }

  async function handleRepoChange(e: any) {
    let owner = e.target.value.split('/')[0]
    let repo = e.target.value.split('/')[1]

    changeRepo(owner, repo, false);
  }

  async function handleBranchChange(e: any) {
    let branch = e.target.value

    changeBranch(branch);
  }

  function dateDiff(date1: Date, date2: Date) {
    const diff = Math.abs(date1.getTime() - date2.getTime());
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);

    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''} ago`;
    } else if (months > 0) {
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
    }
  }

  async function calculateContentHeight() {
    if (navRef.current) {
      return (window.innerHeight - navRef.current.clientHeight)
    } else {
      return 0;
    }
  }

  async function handleResize() {
    let contentHeight = await calculateContentHeight();
    setContentHeight(contentHeight);
  }

  // onresize calls
  useEffect(() => {
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // onload calls
  useEffect(() => {
    async function getUser() {
      let response = await octo.request(`GET /users/${auth.username}`, {
        username: auth.username,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28"
        }
      })

      setUser(response.data)
    }

    async function getRepos() {
      let response = await octo.request(`GET /user/repos`, {
        // username: auth.username,
        sort: "updated",
        type: "all",
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      });

      let initial_repo = response.data[0].full_name
      changeRepo(initial_repo.split('/')[0], initial_repo.split('/')[1], true)
      setRepos(response.data)
    }

    getUser();
    getRepos();
    handleResize();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // endless calls
  useEffect(() => {
    async function getRepos() {
      let response = await octo.request(`GET /user/repos`, {
        // username: auth.username,
        sort: "updated",
        type: "all",
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      });

      updateRepo(repo.full_name.split('/')[0], repo.full_name.split('/')[1], true)
      setRepos(response.data)
    }


    const intervalId = setInterval(() => {
      if (!fetch) {
        getRepos();
        setFetchData({ date: new Date() })
      }
    }, 60000); // Set the interval time in milliseconds

    return () => {
      clearInterval(intervalId);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repo]);


  return (
    <>
      <div className="flex flex-col w-full h-full justify-start items-center">
        <nav ref={navRef} className="relative flex flex-row w-full justify-between items-center p-4 bg-github-slate-700">
          <div className={`absolute top-[4rem] right-[1rem] z-40 flex flex-col w-full max-w-[16rem] bg-github-slate-700 outline outline-1 outline-white/10 divide-y divide-white/10 rounded-md shadow-2xl transition-opacity duration-75 ` + (userMenu ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0")}>
            <div className="flex flex-col px-4 py-2">
              <span className="text-md text-white font-normal">
                Signed in as
              </span>
              <span className="text-md text-white font-medium">
                {user?.login}
              </span>
            </div>
            <div className="flex flex-col py-2">
              <Link
                href="https://github.com/settings/tokens"
                target="_blank"
                className="inline-flex items-center hover:bg-blue-500 px-3 py-1"
              >
                Your Tokens <TabExternalIcon className="inline-block w-4 h-4 ml-1.5" />
              </Link>
            </div>
            <div className="flex flex-col py-2">
              <button onClick={() => auth.logout()} className="inline-flex flex-row px-3 py-1 hover:bg-blue-500">
                Sign Out
              </button>
            </div>
          </div>
          <div className="flex flex-row gap-x-4">
            <h1 className="text-2xl text-white font-medium tracking-tight">
              {user?.name}&apos;s Dashboard
            </h1>
            <select
              key={Math.random()}
              onChange={(e) => handleRepoChange(e)}
              defaultValue={repo.full_name}
              className="flex px-2 py-1 bg-inherit outline outline-1 outline-white/10 text-white rounded-md text-md" name="repo"
            >
              {repos.map((repository : GenericObject) => {
                return <option key={Math.random()} value={repository.full_name}>{repository.full_name}</option>;
              })}
            </select>
          </div>
          <div className="relative flex flex-row justify-start items-center gap-x-4">
            <button onClick={() => setUserMenu(!userMenu)} className="relative flex w-8 h-8 aspect-square rounded-full overflow-clip hover:opacity-90 transition-opacity duration-75">
              {user?.avatar_url ? (
                <Image
                  className="w-full h-full"
                  src={user?.avatar_url}
                  alt="Profile Picture"
                  fill
                />
              ) : (
                <div className="flex justify-center items-center w-full h-full bg-gray-500 rounded-full" />
              )}
            </button>
          </div>
        </nav>
        <div ref={contentRef} className="relative flex flex-col w-full h-full justify-start items-center p-8 bg-github-slate-800" style={{ "height": contentHeight }}>
          <div className={`absolute top-0 left-0 z-50 flex flex-col w-full h-full justify-center items-center gap-y-8 bg-github-slate-800/80 backdrop-blur-sm transition-opacity duration-150 pointer-events-none ` + (repo?.commits !== undefined ? "opacity-0" : "opacity-100")}>
            <h1 className="text-2xl font-semibold text-white">Loading data...</h1>
            <MoonLoader size={24} color="#ffffff" />
          </div>
          {repo?.commits !== undefined ? (
            <div className="flex flex-col w-full h-full justify-start items-center gap-x-8 outline outline-1 outline-white/10 divide-y divide-white/10 rounded-lg overflow-clip">
              <div className="flex flex-row justify-between items-center w-full p-4 bg-github-slate-700">
                <h1 className="text-md text-white font-medium">
                  {repo.full_name} Overview
                </h1>
                {!fetch ? (
                  <span className="text-sm text-neutral-400 font-normal">
                    Last updated {fetchData.date.toLocaleTimeString()}
                  </span>
                ) : (
                  <span className="text-sm text-neutral-400 font-normal">
                    Fetching...
                  </span>
                )}
              </div>
              <div className="flex flex-row w-full gap-x-4 divide-x divide-white/10">
                <div className="flex flex-col w-1/4 p-4 justify-center items-center">
                  <h1 className="inline-flex items-center gap-x-1 text-lg text-white">
                    <GitMergeIcon fill="#A371F7" />
                    {repo.closed_pr.total_count}
                  </h1>
                  <p className="text-neutral-500">
                    Merged Pull Requests
                  </p>
                </div>
                <div className="flex flex-col w-1/4 p-4 justify-center items-center">
                  <h1 className="inline-flex items-center gap-x-1 text-lg text-white">
                    <GitPullRequestIcon fill="#3FB950" />
                    {repo.open_pr.total_count}
                  </h1>
                  <p className="text-neutral-500">
                    Open Pull Requests
                  </p>
                </div>
                <div className="flex flex-col w-1/4 p-4 justify-center items-center">
                  <h1 className="inline-flex items-center gap-x-1 text-lg text-white">
                    <IssueClosedIcon fill="#A371F7" />
                    {repo.closed_issues.total_count}
                  </h1>
                  <p className="text-neutral-500">
                    Closed Issues
                  </p>
                </div>
                <div className="flex flex-col w-1/4 p-4 justify-center items-center">
                  <h1 className="inline-flex items-center gap-x-1 text-lg text-white">
                    <IssueOpenedIcon fill="#3FB950" />
                    {repo.open_issues.total_count}
                  </h1>
                  <p className="text-neutral-500">
                    Open Issues
                  </p>
                </div>
              </div>
              {commit !== "" ? (
                <div className="flex flex-row w-full h-[calc(100%-141px)] divide-x divide-white/10">
                  <div className="flex flex-col w-1/3 divide-y divide-white/10">
                    <div className="sticky flex flex-col w-full p-4">
                      <select
                        key={Math.random() + 1}
                        onChange={(e) => handleBranchChange(e)}
                        defaultValue={branch}
                        className="flex px-2 py-1 bg-inherit outline outline-1 outline-white/10 text-white rounded-md text-md" name="branch"
                      >
                        {
                          Object.keys(repo?.commits).map((entry: any) => {
                            return <option key={Math.random()} value={entry}>{entry}</option>;
                          })
                        }
                      </select>
                    </div>
                    <div className="flex flex-col justify-start overflow-y-auto">
                      <div className="flex flex-col w-full grow divide-y divide-white/10">
                        {repo?.commits[branch]?.map((entry: any) => {
                          return (
                            <button onClick={() => changeCommit(entry.sha)} key={Math.random()} className={`relative flex flex-row justify-star items-center w-full max-w-full p-4 pr-0 ` + (entry.sha === commit ? "bg-github-slate-700" : "bg-github-slate-800")}>
                              <div className="absolute top-0 right-0 z-10 flex w-8 h-full bg-gradient-to-r from-transparent to-github-slate-800">
                              </div>
                              <p className="line-clamp-1 text-ellipsis whitespace-nowrap">
                                <span className="text-sm font-mono px-1 py-0.5 mr-1.5 rounded-md bg-white/10">{entry.sha.substring(0, 7)}</span> {entry.commit.message}
                              </p>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col w-2/3 p-4 gap-y-2">
                    <div className="flex flex-row w-full justify-between items-center">
                      <h1 className="text-3xl text-white font-semibold leading-none">
                        {repo?.commits[branch].find((entry: any) => entry.sha === commit)?.commit?.message}
                      </h1>
                    </div>
                    <div className="flex flex-row items-center gap-x-2">
                      <GitBranchIcon fill="#a3a3a3" />
                      <span className="text-lg text-neutral-400 font-normal">
                        {branch}
                      </span>
                      <span className="text-md text-neutral-400 font-mono font-normal mt-0.5">{commit.substring(0, 7)}
                      </span>
                    </div>
                    <div className="flex flex-row justify-start items-center space-x-2">
                      <div className="relative z-10 flex w-8 h-8 justify-center items-center rounded-full overflow-clip">
                        {repo?.commits[branch].find((entry: any) => entry.sha === commit)?.author?.avatar_url ? (<Image
                          className="z-10"
                          src={repo?.commits[branch].find((entry: any) => entry.sha === commit)?.author?.avatar_url}
                          alt="Author Profile Picture"
                          fill
                        />) : (
                          <MoonLoader size={24} color="#ffffff" />
                        )}
                      </div>
                      <p>
                        <span className="text-lg text-white font-medium">{repo?.commits[branch].find((entry: any) => entry.sha === commit)?.commit?.author?.name}</span>{" "}
                        <span className="text-lg text-neutral-400 font-normal">committed {dateDiff(new Date(repo?.commits[branch].find((entry: any) => entry.sha === commit)?.commit?.author?.date), new Date())}.</span>
                      </p>
                    </div>
                    <div className="flex flex-row justify-start items-start mt-2">
                      <p className="text-lg text-white">
                        {repo?.commits[branch].find((entry: any) => entry.sha === commit)?.commit?.message}
                      </p>
                    </div>
                  </div>
                </div>)
                : (
                  <div className="flex flex-col w-full h-full justify-center items-center">
                    <h1 className="text-2xl font-semibold text-white">No commits found.</h1>
                  </div>
                )}
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
    </>
  );
}
