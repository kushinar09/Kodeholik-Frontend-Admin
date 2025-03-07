"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { X, ArrowUpDown, Search } from "lucide-react"
import { useAuth } from "@/provider/AuthProvider"
import { ENDPOINTS } from "@/lib/constants"

export function FilterBar({ onFilterChange, filters: initialFilters }) {
  const [suggestions, setSuggestions] = useState([])
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [tempSearch, setTempSearch] = useState("")
  const containerRef = useRef(null)

  const [filters, setFilters] = useState(
    initialFilters || {
      page: 0,
      size: 5,
      title: "",
      difficulty: "EASY",
      status: "PUBLIC",
      isActive: true,
      sortBy: "noSubmission",
      ascending: true
    }
  )

  const { apiCall } = useAuth()

  useEffect(() => {
    if (!tempSearch) {
      setSuggestions([])
      return
    }

    const fetchSuggestions = async () => {
      try {
        const response = await apiCall(ENDPOINTS.GET_SUGGEST_SEARCH.replace(":text", encodeURIComponent(tempSearch)))
        if (!response.ok) throw new Error("Failed to fetch suggestions")
        const data = await response.json()
        setSuggestions(data)
      } catch (error) {
        console.error(error)
      }
    }

    const debounceTimeout = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(debounceTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tempSearch])

  useEffect(() => {
    if (initialFilters) {
      setFilters(initialFilters)
    }
  }, [initialFilters])

  useEffect(() => {
    onFilterChange(filters)
  }, [filters])

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setSuggestions([])
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev))
    } else if (e.key === "ArrowUp") {
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0))
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      const selectedSuggestion = suggestions[highlightedIndex]
      setTempSearch(selectedSuggestion)
      // setSearch(selectedSuggestion)
      // onSearchChange(selectedSuggestion)
      setSuggestions([])
    }
  }

  const clearFilters = () => {
    const clearedFilters = {
      page: 0,
      size: 5,
      title: "",
      difficulty: "EASY",
      status: "PUBLIC",
      isActive: true,
      sortBy: "noSubmission",
      ascending: true
    }
    setFilters(clearedFilters)
    onFilterChange(clearedFilters)
    setTempSearch("")
  }

  const toggleSortDirection = () => {
    const newFilters = { ...filters, ascending: !filters.ascending }
    setFilters(newFilters)
  }

  return (
    <>
      <div className="flex flex-wrap gap-4 items-center mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-input-border w-5 h-5 transition-colors group-focus-within:text-primary" />
          <Input
            className="pl-12 h-12 text-lg text-input-text bg-input-bg/50 border-input-border rounded-xl transition focus:border-input-borderFocus"
            placeholder="Search problems..."
            value={tempSearch}
            onChange={(e) => {
              const newSearch = e.target.value
              setTempSearch(newSearch)
              setHighlightedIndex(-1) // Reset index when typing
            }}
            onKeyDown={handleKeyDown}
          />
          {/* Search Button */}
          <div className="absolute right-0 top-0 p-2 h-full">
            <Button
              className="h-full"
              onClick={() => {
                // setSearch(tempSearch)
                // onSearchChange(tempSearch)
                setSuggestions([])
              }}
            >
              Search
            </Button>
          </div>

          {/* Suggestions List */}
          {suggestions.length > 0 && (
            <ul className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 shadow-md rounded-md z-10">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className={`p-2 cursor-pointer ${index === highlightedIndex ? "bg-gray-200" : "hover:bg-gray-100"
                    }`}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onMouseDown={() => {
                    setTempSearch(suggestion)
                    // setSearch(suggestion)
                    // onSearchChange(suggestion)
                    setSuggestions([])
                  }}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>


        <Select value={filters.difficulty} onValueChange={(value) => handleFilterChange("difficulty", value)}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EASY">Easy</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="HARD">Hard</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="PUBLIC">Public</SelectItem>
            <SelectItem value="PRIVATE">Private</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            checked={filters.isActive}
            onCheckedChange={(checked) => handleFilterChange("isActive", checked)}
          />
          <Label htmlFor="isActive">Active Only</Label>
        </div>

        <Button variant="outline" onClick={clearFilters}>
          <X className="h-4 w-4 mr-2" />
          Clear
        </Button>
      </div>
      <div className="flex gap-4">
        <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange("sortBy", value)}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="difficulty">Difficulty</SelectItem>
            <SelectItem value="acceptanceRate">Acceptance Rate</SelectItem>
            <SelectItem value="noSubmission">Submissions</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={toggleSortDirection} className="flex items-center">
          <ArrowUpDown className="h-4 w-4 mr-2" />
          {filters.ascending ? "Ascending" : "Descending"}
        </Button>
      </div>
    </>
  )
}

