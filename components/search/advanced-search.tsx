"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Search, X, CalendarIcon, SlidersHorizontal } from "lucide-react"
import { format } from "date-fns"

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

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void
  onClear: () => void
}

const availableTags = ["React", "JavaScript", "Frontend", "Database", "SQL", "Design", "ML", "AI", "Python", "UX", "UI"]

export function AdvancedSearch({ onSearch, onClear }: AdvancedSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    tags: [],
    dateRange: {},
    sortBy: "relevance",
    sortOrder: "desc",
  })

  const handleSearch = () => {
    onSearch(filters)
    setIsOpen(false)
  }

  const handleClear = () => {
    setFilters({
      query: "",
      tags: [],
      dateRange: {},
      sortBy: "relevance",
      sortOrder: "desc",
    })
    onClear()
  }

  const toggleTag = (tag: string) => {
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }))
  }

  const hasActiveFilters =
    filters.query ||
    filters.tags.length > 0 ||
    filters.isPublic !== undefined ||
    filters.isFavorite !== undefined ||
    filters.dateRange.from ||
    filters.dateRange.to

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={filters.query}
            onChange={(e) => setFilters((prev) => ({ ...prev, query: e.target.value }))}
            className="pl-10"
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative bg-transparent">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full" />}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-0" align="end">
            <Card className="border-0 shadow-none">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Advanced Search</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Tags */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={filters.tags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Note Type */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Note Type</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="public"
                        checked={filters.isPublic === true}
                        onCheckedChange={(checked) =>
                          setFilters((prev) => ({ ...prev, isPublic: checked ? true : undefined }))
                        }
                      />
                      <Label htmlFor="public" className="text-sm">
                        Public notes only
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="private"
                        checked={filters.isPublic === false}
                        onCheckedChange={(checked) =>
                          setFilters((prev) => ({ ...prev, isPublic: checked ? false : undefined }))
                        }
                      />
                      <Label htmlFor="private" className="text-sm">
                        Private notes only
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="favorites"
                        checked={filters.isFavorite === true}
                        onCheckedChange={(checked) =>
                          setFilters((prev) => ({ ...prev, isFavorite: checked ? true : undefined }))
                        }
                      />
                      <Label htmlFor="favorites" className="text-sm">
                        Favorites only
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Date Range</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="justify-start text-left font-normal bg-transparent">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.dateRange.from ? format(filters.dateRange.from, "PPP") : "From"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filters.dateRange.from}
                          onSelect={(date) =>
                            setFilters((prev) => ({ ...prev, dateRange: { ...prev.dateRange, from: date } }))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="justify-start text-left font-normal bg-transparent">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.dateRange.to ? format(filters.dateRange.to, "PPP") : "To"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filters.dateRange.to}
                          onSelect={(date) =>
                            setFilters((prev) => ({ ...prev, dateRange: { ...prev.dateRange, to: date } }))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Sort Options */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Sort By</Label>
                    <Select
                      value={filters.sortBy}
                      onValueChange={(value: "title" | "date" | "relevance") =>
                        setFilters((prev) => ({ ...prev, sortBy: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Relevance</SelectItem>
                        <SelectItem value="title">Title</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Order</Label>
                    <Select
                      value={filters.sortOrder}
                      onValueChange={(value: "asc" | "desc") => setFilters((prev) => ({ ...prev, sortOrder: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">Descending</SelectItem>
                        <SelectItem value="asc">Ascending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleSearch} className="flex-1">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                  <Button variant="outline" onClick={handleClear}>
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-3">
          {filters.query && (
            <Badge variant="secondary" className="gap-1">
              Query: "{filters.query}"
              <button onClick={() => setFilters((prev) => ({ ...prev, query: "" }))}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              #{tag}
              <button onClick={() => toggleTag(tag)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filters.isPublic !== undefined && (
            <Badge variant="secondary" className="gap-1">
              {filters.isPublic ? "Public" : "Private"}
              <button onClick={() => setFilters((prev) => ({ ...prev, isPublic: undefined }))}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.isFavorite && (
            <Badge variant="secondary" className="gap-1">
              Favorites
              <button onClick={() => setFilters((prev) => ({ ...prev, isFavorite: undefined }))}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
