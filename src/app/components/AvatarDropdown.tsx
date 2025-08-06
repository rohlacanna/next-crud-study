'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Settings, LogOut, ChevronDown, Camera } from 'lucide-react'
import { signOut } from 'next-auth/react'

interface AvatarDropdownProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string
  }
}

export default function AvatarDropdown({ user }: AvatarDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Gerar iniciais do nome
  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    if (email) {
      return email.charAt(0).toUpperCase()
    }
    return 'U'
  }

  const handleSignOut = () => {
    setIsOpen(false)
    signOut()
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-200 rounded-xl px-3 py-2 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md"
      >
        {/* Avatar Image or Initials */}
        <div className="relative">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || 'User'}
              className="w-8 h-8 rounded-lg object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-semibold">
              {getInitials(user.name, user.email)}
            </div>
          )}

          {/* Online indicator */}
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        </div>

        {/* User Info */}
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-900 truncate max-w-32">
            {user.name || user.email}
          </p>
          <p className="text-xs text-gray-500 capitalize">
            {user.role?.toLowerCase()}
          </p>
        </div>

        {/* Dropdown Arrow */}
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
            }`}
        />
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200 py-2 z-50"
          >
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name || 'User'}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold text-lg">
                    {getInitials(user.name, user.email)}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user.name || 'Anonymous User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user.email}
                  </p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mt-1">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <motion.button
                whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.05)' }}
                className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:text-indigo-600 transition-colors"
                onClick={() => {
                  setIsOpen(false)
                  // TODO: Implementar página de perfil
                }}
              >
                <User className="h-4 w-4" />
                <span>View Profile</span>
              </motion.button>

              <motion.button
                whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.05)' }}
                className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:text-indigo-600 transition-colors"
                onClick={() => {
                  setIsOpen(false)
                  // TODO: Implementar upload de avatar
                }}
              >
                <Camera className="h-4 w-4" />
                <span>Change Avatar</span>
              </motion.button>

              <motion.button
                whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.05)' }}
                className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:text-indigo-600 transition-colors"
                onClick={() => {
                  setIsOpen(false)
                  // TODO: Implementar configurações
                }}
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </motion.button>

              <div className="border-t border-gray-100 my-2"></div>

              <motion.button
                whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.05)' }}
                className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:text-red-600 transition-colors"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}