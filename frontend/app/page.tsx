'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token')
    
    if (token) {
      // User is logged in, redirect to overview
      router.push('/overview')
    } else {
      // User is not logged in, redirect to login
      router.push('/login')
    }
    
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="home-loading-screen">
        <div className="home-loading-content">
          <div className="home-loading-spinner" />
          <p className="home-loading-text">Loading...</p>
        </div>
      </div>
    )
  }

  return null
}
