import React, { useState } from 'react'
import DashboardCard10 from "../dashboard/DashboardCard10"
import Sidebar from '../Sidebar'
import Header from '../Header'
import WelcomeBanner from '../dashboard/WelcomeBanner'
import DashboardAvatars from '../dashboard/DashboardAvatars'
import Banner from '../Banner'

function Community() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden">

            {/* Sidebar */}
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            {/* Content area */}
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">

                {/*  Site header */}
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <main>
                    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">

                        {/* Welcome banner */}
                        <WelcomeBanner />

                        {/* Dashboard actions */}
                        <div className="sm:flex sm:justify-between sm:items-center mb-8">

                            {/* Left: Avatars */}
                            {/* <DashboardAvatars /> */}
                        </div>


                        <div className='mt-10'>
                            <DashboardCard10 />
                        </div>

                    </div>
                </main>

                <Banner />

            </div>
        </div>
    )
}

export default Community