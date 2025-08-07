'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { PlusCircle, Edit, Trash2, LogOut, User, Search, Filter, Calendar, Eye, X } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import AvatarDropdown from '../components/AvatarDropdown'
import { ModeToggle } from '../components/ModeToggle'

interface Post {
  id: string
  title: string
  content: string | null
  published: boolean
  author: {
    name: string | null
    email: string
  }
  createdAt: string
  updatedAt: string
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPublished, setFilterPublished] = useState<'all' | 'published' | 'draft'>('all')
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    published: false
  })

  // Redirect se não estiver logado
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Carregar posts
  useEffect(() => {
    if (session) {
      fetchPosts()
    }
  }, [session])

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts')
      const data = await response.json()
      setPosts(data.posts || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
      toast.error('Failed to load posts')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const loadingToast = toast.loading(editingPost ? 'Updating post...' : 'Creating post...')

    try {
      const url = editingPost ? `/api/posts/${editingPost.id}` : '/api/posts'
      const method = editingPost ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchPosts()
        setShowModal(false)
        setEditingPost(null)
        setFormData({ title: '', content: '', published: false })
        toast.success(editingPost ? 'Post updated successfully!' : 'Post created successfully!', {
          id: loadingToast
        })
      } else {
        throw new Error('Failed to save post')
      }
    } catch (error) {
      toast.error('Something went wrong!', { id: loadingToast })
    }
  }

  const handleEdit = (post: Post) => {
    setEditingPost(post)
    setFormData({
      title: post.title,
      content: post.content || '',
      published: post.published
    })
    setShowModal(true)
  }

  const handleDelete = async (postId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return

    const loadingToast = toast.loading('Deleting post...')

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchPosts()
        toast.success('Post deleted successfully!', { id: loadingToast })
      } else {
        throw new Error('Failed to delete post')
      }
    } catch (error) {
      toast.error('Failed to delete post', { id: loadingToast })
    }
  }

  const openCreateModal = () => {
    setEditingPost(null)
    setFormData({ title: '', content: '', published: false })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingPost(null)
    setFormData({ title: '', content: '', published: false })
  }

  // Filter posts
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)

    const matchesFilter = filterPublished === 'all' ||
      (filterPublished === 'published' && post.published) ||
      (filterPublished === 'draft' && !post.published)

    return matchesSearch && matchesFilter
  })

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="h-6 bg-gray-300 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <span className="text-sm text-muted-foreground">
                {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <ModeToggle />
              <AvatarDropdown
                user={{
                  name: session?.user?.name,
                  email: session?.user?.email,
                  image: session?.user?.image,
                  role: session?.user?.role
                }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button
            onClick={openCreateModal}
            className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <PlusCircle className="h-5 w-5" />
            <span>New Post</span>
          </button>

          <div className="flex flex-1 gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring bg-background"
              />
            </div>

            <select
              value={filterPublished}
              onChange={(e) => setFilterPublished(e.target.value as 'all' | 'published' | 'draft')}
              className="px-4 py-3 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring bg-background"
            >
              <option value="all">All Posts</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>
          </div>
        </div>

        {/* Posts Grid */}
        <AnimatePresence mode="wait">
          {filteredPosts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                <PlusCircle className="h-12 w-12 text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No posts found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm ? 'Try adjusting your search terms' : 'Create your first post to get started!'}
              </p>
              {!searchTerm && (
                <button
                  onClick={openCreateModal}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl transition-colors"
                >
                  Create First Post
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 border border-border group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-card-foreground mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {post.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${post.published
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                          }`}>
                          {post.published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(post)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id, post.title)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {post.content && (
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      {post.content}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border">
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>{post.author.name || post.author.email}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={closeModal}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {editingPost ? 'Edit Post' : 'Create New Post'}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                      placeholder="Enter post title..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Content
                    </label>
                    <textarea
                      rows={8}
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                      placeholder="Write your post content..."
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="published"
                      checked={formData.published}
                      onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="published" className="ml-3 block text-sm text-gray-900 dark:text-gray-300">
                      Publish immediately
                    </label>
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all duration-200 font-medium"
                    >
                      {editingPost ? 'Update Post' : 'Create Post'}
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-6 py-3 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}