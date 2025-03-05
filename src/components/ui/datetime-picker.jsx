"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { CalendarIcon } from "lucide-react"

const FormSchema = z.object({
  time: z.date({
    required_error: "A date and time is required."
  })
})

export function DateTimePicker24hForm({ value, onChange }) {
  console.log(value)

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      time: new Date(value) // Store as Date object
    }
  });

  function handleDateSelect(date) {
    if (date) {
      form.setValue("time", date)
      onChange && onChange(date)
    }
  }

  function handleTimeChange(type, value) {
    const currentDate = form.getValues("time") || new Date()
    let newDate = new Date(currentDate)

    if (type === "hour") {
      newDate.setHours(parseInt(value, 10))
    } else if (type === "minute") {
      newDate.setMinutes(parseInt(value, 10))
    }

    form.setValue("time", newDate)
    onChange && onChange(newDate)
  }

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="time"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <div
                    className={cn(
                      "flex items-center justify-between w-full pl-3 text-left font-normal cursor-pointer border border-input rounded-md py-2 px-3",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    <span>
                      {field.value ? (
                        format(field.value, "dd/MM/yyyy HH:mm")
                      ) : (
                        <span>DD/MM/YYYY HH:mm</span>
                      )}
                    </span>
                    <CalendarIcon className="h-4 w-4 opacity-50" />
                  </div>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <div className="sm:flex">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                  <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
                    <ScrollArea className="w-64 sm:w-auto">
                      <div className="flex sm:flex-col p-2">
                        {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                          <button
                            key={hour}
                            className={cn(
                              "sm:w-full shrink-0 aspect-square p-2",
                              field.value?.getHours() === hour
                                ? "bg-primary text-white"
                                : "hover:bg-accent"
                            )}
                            onClick={() => handleTimeChange("hour", hour.toString())}
                          >
                            {hour}
                          </button>
                        ))}
                      </div>
                      <ScrollBar orientation="horizontal" className="sm:hidden" />
                    </ScrollArea>
                    <ScrollArea className="w-64 sm:w-auto">
                      <div className="flex sm:flex-col p-2">
                        {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                          <button
                            key={minute}
                            className={cn(
                              "sm:w-full shrink-0 aspect-square p-2",
                              field.value?.getMinutes() === minute
                                ? "bg-primary text-white"
                                : "hover:bg-accent"
                            )}
                            onClick={() => handleTimeChange("minute", minute.toString())}
                          >
                            {minute.toString().padStart(2, "0")}
                          </button>
                        ))}
                      </div>
                      <ScrollBar orientation="horizontal" className="sm:hidden" />
                    </ScrollArea>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
    </Form>
  )
}
