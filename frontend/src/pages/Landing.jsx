import React from 'react'
import HomeVideo from '../assets/home.mp4'
import { Link } from 'react-router-dom'
import Logo from '../assets/image.png'

function Landing() {
    return (
        <div className="relative flex items-center justify-center h-screen overflow-hidden">
            {/* Content Wrapper */}
            <div className="relative z-30 p-6 sm:p-4 text-white bg-purple-300 bg-opacity-65 rounded-xl w-full max-w-4xl text-center">
                {/* Announcement Banner */}
                <div className="flex justify-center px-6 sm:px-2">
                    <Link
                        to={"/login"}
                        className="inline-flex items-center gap-x-2 bg-white border border-gray-200 text-sm text-gray-800 p-2 rounded-full transition hover:border-gray-300 dark:bg-neutral-800 dark:border-neutral-700 dark:hover:border-neutral-600 dark:text-neutral-200"
                    >
                        Join the community
                        <span className="py-1.5 px-2 inline-flex justify-center items-center rounded-full bg-gray-200 font-semibold text-sm text-gray-600 dark:bg-neutral-700 dark:text-neutral-400">
                            <svg
                                className="size-4"
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="m9 18 6-6-6-6" />
                            </svg>
                        </span>
                    </Link>
                </div>

                {/* Title */}
                <div className="mt-5 max-w-2xl mx-auto">
                    <h1 className="text-3xl sm:text-2xl lg:text-4xl font-bold text-gray-800 dark:text-neutral-200">
                        <span className="bg-clip-text bg-gradient-to-tl from-blue-600 to-violet-600 text-transparent">
                            Campus Vibes:
                        </span>{" "}
                        Your Campus, Your Connection, Your Voice
                    </h1>
                </div>

                {/* Logo */}
                <div className="flex justify-center items-center mt-4">
                    <img className="h-24 sm:h-20 w-auto" src={Logo} alt="Your Collage" />
                </div>

                {/* Description */}
                <div className="mt-5 max-w-3xl mx-auto">
                    <p className="text-lg sm:text-base text-black">
                        <span className="font-semibold">Campus Vibes:</span> Feel the Pulse of Campus Life!
                    </p>
                </div>

                {/* Buttons */}
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                    <Link
                        to={"/login"}
                        onClick={() => setActive("Login")}
                        className="inline-flex justify-center items-center gap-x-3 bg-gradient-to-tl from-blue-600 to-violet-600 hover:from-violet-600 hover:to-blue-600 border border-transparent text-white text-sm font-medium rounded-md focus:outline-none focus:ring-1 focus:ring-gray-600 py-3 px-4 dark:focus:ring-offset-gray-800"
                    >
                        Login
                        <svg
                            className="size-4"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="m9 18 6-6-6-6" />
                        </svg>
                    </Link>
                    <Link
                        to={"/register"}
                        onClick={() => setActive("Signup")}
                        className="inline-flex justify-center items-center gap-x-3 bg-gradient-to-tl from-blue-600 to-violet-600 hover:from-violet-600 hover:to-blue-600 border border-transparent text-white text-sm font-medium rounded-md focus:outline-none focus:ring-1 focus:ring-gray-600 py-3 px-4 dark:focus:ring-offset-gray-800"
                    >
                        SignUp
                    </Link>
                </div>
            </div>

            {/* Background Video */}
            <video
                autoPlay
                loop
                muted
                className="absolute z-10 w-full h-full object-cover"
            >
                <source src={HomeVideo} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        </div>

    )
}

export default Landing