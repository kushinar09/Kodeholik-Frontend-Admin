"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"

export function FilterBar({ difficulties, topics, skills, onFilterChange }) {
  const [filters, setFilters] = useState({
    search: "",
    difficulty: "",
    topics: [],
    skills: [],
    status: ""
  })

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleArrayFilterChange = (key, value) => {
    const newArray = filters[key].includes(value)
      ? filters[key].filter((item) => item !== value)
      : [...filters[key], value]
    handleFilterChange(key, newArray)
  }

  const clearFilters = () => {
    const clearedFilters = {
      search: "",
      difficulty: "",
      topics: [],
      skills: [],
      status: ""
    }
    setFilters(clearedFilters)
    onFilterChange(clearedFilters)
  }

  return (
    <div className="flex flex-wrap gap-4 items-center mb-6">
      <Input
        placeholder="Search problems..."
        value={filters.search}
        onChange={(e) => handleFilterChange("search", e.target.value)}
        className="w-full md:w-64"
      />
      <Select value={filters.difficulty} onValueChange={(value) => handleFilterChange("difficulty", value)}>
        <SelectTrigger className="w-full md:w-40">
          <SelectValue placeholder="Difficulty" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Difficulties</SelectItem>
          {difficulties.map((diff) => (
            <SelectItem key={diff} value={diff}>
              {diff}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Topics</Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            {topics.map((topic) => (
              <div key={topic} className="flex items-center space-x-2">
                <Checkbox
                  id={`topic-${topic}`}
                  checked={filters.topics.includes(topic)}
                  onCheckedChange={() => handleArrayFilterChange("topics", topic)}
                />
                <Label htmlFor={`topic-${topic}`}>{topic}</Label>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Skills</Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            {skills.map((skill) => (
              <div key={skill} className="flex items-center space-x-2">
                <Checkbox
                  id={`skill-${skill}`}
                  checked={filters.skills.includes(skill)}
                  onCheckedChange={() => handleArrayFilterChange("skills", skill)}
                />
                <Label htmlFor={`skill-${skill}`}>{skill}</Label>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
        <SelectTrigger className="w-full md:w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline" onClick={clearFilters}>
        <X className="h-4 w-4 mr-2" />
        Clear Filters
      </Button>
    </div>
  )
}

