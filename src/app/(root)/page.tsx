import { SignedIn, SignedOut, SignInButton, SignOutButton, SignUpButton, UserButton } from '@clerk/clerk-react'
import React from 'react'
import Header from './_components/Header'
import EditorPannel from './_components/EditorPannel'
import OutputPannel from './_components/OutputPannel'

function Home() {
  return (
    <div className='min-h-screen'>
      <div className='max-w-[1800px] mx-auto p-4'>
        <Header/>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
          <EditorPannel/>
          <OutputPannel/>
        </div>
        </div>
    </div>
  )
}

export default Home
