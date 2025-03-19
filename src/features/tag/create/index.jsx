"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormControl } from "@/components/ui/form"

export function CreateTagDialog({ open, onOpenChange, onSubmit }) {
    const [tag, setTag] = useState({
        name: "",
        type: "",
        level: ""
    })

    const [types, setTypes] = useState([
        { key: "SKILL", name: "Skill" },
        { key: "TOPIC", name: "Topic" },
        { key: "LANGUAGE", name: "Language" }
    ])

    const [levels, setLevels] = useState([
        { key: "FUNDAMENTAL", name: "Fundamental" },
        { key: "INTERMEDIATE", name: "Intermediate" },
        { key: "ADVANCED", name: "Advanced" }
    ])

    const [isSkillType, setIsSkillType] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target
        setTag((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if(tag.type !== "SKILL") {
            tag.level = null;
        }
        onSubmit(tag)
    }

    useEffect(() => {
        setTag({
            name: "",
            type: "SKILL",
            level: "INTERMEDIATE"
        })
        console.log("SA")
    }, [open])

    useEffect(() => {
        if(tag.type === "SKILL") {
            setIsSkillType(true);
        }
        else {
            setIsSkillType(false);
        }
    }, [tag])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Tag</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                value={tag.name}
                                onChange={handleChange}
                                className="col-span-3"
                                required
                                minLength={1}
                                maxLength={200}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="type" className="text-right">
                                Type
                            </Label>
                            <div className="col-span-3">

                                <Select className="w-full" id="type"
                                    name="type"
                                    onValueChange={(value) => setTag((prev) => ({ ...prev, "type": value }))}
                                    defaultValue={tag.type ? String(tag.type) : undefined}
                                >
                                    <SelectTrigger style={{ height: "44px !important" }} className="h-10 w-full">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {types.map((type) => (
                                            <SelectItem key={type.key} value={type.key}>
                                                {type.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className={`grid grid-cols-4 items-center gap-4 ${isSkillType ? "block" : "hidden"}`}>
                            <Label htmlFor="type" className="text-right">
                                Level
                            </Label>
                            <div className="col-span-3">

                                <Select className="w-full" id="level"
                                    name="level"
                                    onValueChange={(value) => setTag((prev) => ({ ...prev, "level": value }))}
                                    defaultValue={tag.level ? String(tag.level) : undefined}
                                >
                                    <SelectTrigger style={{ height: "44px !important" }} className="h-10 w-full">
                                        <SelectValue placeholder="Select level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {levels.map((level) => (
                                            <SelectItem key={level.key} value={level.key}>
                                                {level.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {/* Add inputs for languageSupports and problemRequests here */}
                    </div>
                    <DialogFooter>
                        <Button type="submit">Create Tag</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
