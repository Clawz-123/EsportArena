import React from 'react'
import Navbar from '../../components/common/Header'

const Home = () => {
  return (
    <div>
      <Navbar />
      <main className="flex items-center justify-center min-h-screen pt-16">
        <h1 className="text-5xl font-bold text-center">
          Welcome to Esports Arena
        </h1>
      </main>
    </div>
  )
}

export default Home
