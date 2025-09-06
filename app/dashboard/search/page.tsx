"use client"

import { useState, useEffect } from "react"
import { AdvancedSearch } from "@/components/search/advanced-search"
import { SearchResults } from "@/components/search/search-results"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { SearchAPI } from "@/lib/api"

interface SearchFilters {
  query: string
  tags: string[]
  isPublic?: boolean
  isFavorite?: boolean
  dateRange: {
    from?: Date
    to?: Date
  }
  sortBy: "title" | "date" | "relevance"
  sortOrder: "asc" | "desc"
}

type SearchResult = {
  id: number
  title: string
  content: string
  isPublic: boolean
  createdAt: string
  tags: string[]
  category: string
  isFavorite: boolean
  relevanceScore?: number
  matchedContent?: string
}

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentQuery, setCurrentQuery] = useState("")

  // Initialize search from URL params
  useEffect(() => {
    const query = searchParams.get("q")
    if (query) {
      setCurrentQuery(query)
      performSearch({ query, tags: [], dateRange: {}, sortBy: "relevance", sortOrder: "desc" })
    }
  }, [searchParams])

  const performSearch = async (filters: SearchFilters) => {
    setIsLoading(true)
    setCurrentQuery(filters.query)

    try {
      const data = await SearchAPI.search({
        query: filters.query,
        tags: filters.tags,
        isPublic: filters.isPublic,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      })
      setSearchResults(data.results || [])
    } catch (error) {
      console.error("Search failed:", error)
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearSearch = () => {
    setSearchResults([])
    setCurrentQuery("")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-border px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <div className="bg-primary rounded-lg p-2">
                <Search className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-balance">Search Notes</h1>
                <p className="text-muted-foreground text-pretty">Find and filter your notes with advanced search</p>
              </div>
            </div>
          </div>

          {/* Search Interface */}
          <AdvancedSearch onSearch={performSearch} onClear={handleClearSearch} />
        </div>
      </header>

      {/* Results */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              <span className="ml-3 text-muted-foreground">Searching...</span>
            </div>
          ) : (
            <SearchResults results={searchResults} query={currentQuery} totalResults={searchResults.length} />
          )}
        </div>
      </main>
    </div>
  )
}
