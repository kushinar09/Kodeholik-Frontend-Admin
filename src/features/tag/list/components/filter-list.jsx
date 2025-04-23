"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"
import { useDebounce } from "@/features/users/list/components/use-debounce"

export function FilterBar({ onFilterChange, currentType }) {
  const [filters, setFilters] = useState({
    search: "",
    type: currentType || "LANGUAGE"
  })


  const [searchInput, setSearchInput] = useState("")

  // Debounce the search input with a 500ms delay
  const debouncedSearchTerm = useDebounce(searchInput, 500)

  // Update filters only after debounce
  useEffect(() => {
    handleFilterChange("search", debouncedSearchTerm)
  }, [debouncedSearchTerm])

  const handleSearchInputChange = (e) => {
    setSearchInput(e.target.value)
  }

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  useEffect(() => {
    setFilters({
      search: filters.search,
      type: currentType || "LANGUAGE"
    })
  }, [currentType])


  const clearFilters = () => {
    const clearedFilters = {
      search: "",
      type: "LANGUAGE"
    }
    setFilters(clearedFilters)
    onFilterChange(clearedFilters)
  }

  return (
    <div className="flex flex-wrap gap-4 items-center mb-4 mt-4">
      <Input
        placeholder="Search tag..."
        value={searchInput}
        onChange={handleSearchInputChange}
        className="w-full md:w-64"
      />
      <Select value={filters.type} onValueChange={(value) => handleFilterChange("type", value)}>
        <SelectTrigger className="w-full md:w-40">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent defaultValue="LANGUAGE">
          <SelectItem value="LANGUAGE">Language</SelectItem>
          <SelectItem value="TOPIC">Topic</SelectItem>
          <SelectItem value="SKILL">Skill</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" onClick={clearFilters}>
        <X className="h-4 w-4 mr-2" />
        Clear Filters
      </Button>
    </div>
  )
}

