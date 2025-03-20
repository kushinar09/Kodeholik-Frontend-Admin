"use client"
import * as React from "react"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { addDays, format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { useDebounce } from "./use-debounce"

export function FilterBar({ onFilterChange }) {
  const [open, setOpen] = useState(false)
  const calendarRef = useRef(null)

  const [date, setDate] = React.useState({
    from: new Date(2024, 0, 20),
    to: new Date(2026, 0, 20)
  })

  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    role: "all",
    date: date
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

  const handleDateChange = () => {
    console.log(date)
  }

  const clearFilters = () => {
    const clearedFilters = {
      search: "",
      status: "all",
      role: "all",
      date: {
        from: new Date(2024, 0, 20),
        to: new Date(2026, 0, 20)
      }
    }
    setDate({
      from: new Date(2024, 0, 20),
      to: new Date(2026, 0, 20)
    })
    setFilters(clearedFilters)
    onFilterChange(clearedFilters)
  }

  useEffect(() => {
    if (!open) {
      handleFilterChange("date", date)

    }
  }, [open])

  return (
    <div className="flex flex-wrap gap-4 items-center mb-4 mt-4">
      <Input
        placeholder="Search username or fullname..."
        value={searchInput}
        onChange={handleSearchInputChange}
        className="w-full md:w-64"
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" ref={calendarRef}>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            value={date}
            onClickOutside={handleDateChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
      <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
        <SelectTrigger className="w-full md:w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent defaultValue="all">
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="ACTIVATED">Activated</SelectItem>
          <SelectItem value="NOT_ACTIVATED">Not Activated</SelectItem>
          <SelectItem value="BANNED">Banned</SelectItem>
        </SelectContent>
      </Select>
      <Select value={filters.role} onValueChange={(value) => handleFilterChange("role", value)}>
        <SelectTrigger className="w-full md:w-40">
          <SelectValue placeholder="Role" />
        </SelectTrigger>
        <SelectContent defaultValue="all">
          <SelectItem value="all">All Roles</SelectItem>
          <SelectItem value="STUDENT">Student</SelectItem>
          <SelectItem value="TEACHER">Teacher</SelectItem>
          <SelectItem value="EXAMINER">Examiner</SelectItem>
          <SelectItem value="ADMIN">Admin</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline" onClick={clearFilters}>
        <X className="h-4 w-4 mr-2" />
                Clear Filters
      </Button>
    </div>
  )
}

