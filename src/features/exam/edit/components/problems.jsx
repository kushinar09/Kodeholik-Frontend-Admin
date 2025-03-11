"use client"
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/features/problem/ProblemCreate/components/multi-select";
import { toast } from "sonner";
import { getPrivateProblemForExaminer } from "@/lib/api/exam_api";
import { useAuth } from "@/provider/AuthProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod"

const formSchema = z.object({
    languageSupports: z.array(z.string()).min(1, "Language support cannot be empty"),
    problems: z.array(
        z.object({
            problemLink: z.string().min(1, "Problem link cannot be empty"),
            points: z.coerce.number().min(1, "Points must be at least 1").max(10, "Points cannot exceed 10"),
        })
    )
})
const mockPrivateProblem = {
    id: 0,
    title: '2',
    link: '2'
}
export function EditExamProblems({ onNext, onPrevious, formData, updateFormData }) {
    const [formValues, setFormValues] = useState(formData.problems || {});
    const [availableLanguages, setAvailableLanguages] = useState(['Java', 'C']);
    const [problemList, setProblemList] = useState([mockPrivateProblem]);
    const { apiCall } = useAuth();
    const [selectedProblems, setSelectedProblems] = useState([]);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            languageSupports: formData.problems.languageSupports,
            problems: formData.problems.problems
        },
    })
    const fetchPrivateProblem = async () => {
        try {
            const data = await getPrivateProblemForExaminer(apiCall)
            setProblemList(data.length > 0 ? data : [mockPrivateProblem]);
            console.log("API Response:", data)
        } catch (error) {
            console.error("Error fetching exams:", error)
        } finally {
        }
    }

    useEffect(() => {
        console.log("Form", formData);
        fetchPrivateProblem();
        addSelectedProblems();
    }, [])

    const addSelectedProblems = () => {
        const selected = [];
        for (const problem of formValues.problems) {
            selected.push(problem.problemLink);
        }
        setSelectedProblems(selected);
    }


    const watchedValues = form.watch()
    const problemsChanged = form.watch("problems");

    useEffect(() => {
        const values = form.getValues()
        setFormValues((prev) => ({
            ...prev,
            problemsChanged: values.problems
        }))
    }, [problemsChanged])

    useEffect(() => {
        const subscription = form.watch((value, { name, type }) => {
            if (name?.startsWith("problems") || type === "all") {
                const currentValues = form.getValues().problems
                handleProblemsChange(currentValues)

            }
        })

        // Cleanup subscription on unmount
        return () => subscription.unsubscribe()
    }, [form])


    const addProblem = async () => {
        // Get current values
        const currentValues = form.getValues().problems;
        console.log(currentValues);

        // Check if all existing problems have both problemLink and points
        const allProblemsValid = currentValues.every(problem =>
            problem.problemLink && problem.points > 0 && problem.points <= 10
        );

        if (allProblemsValid) {
            form.clearErrors("problems");
            form.setValue("problems", [...currentValues, { problemLink: '', points: 1 }]);
            console.log(form.getValues());
        } else {
            await form.trigger("problems");
        }
    };

    const removeProblem = (index) => {
        const currentValues = form.getValues().problems;
        if (currentValues.length > 1) {
            const newValues = [...currentValues]
            newValues.splice(index, 1)
            form.setValue("problems", newValues)
        }
    }

    function onSubmit(values) {
        const currentValues = form.getValues();
        let totalPoint = 0;
        for (let value of currentValues.problems) {
            totalPoint += Number(value.points);
        }
        if (Number(totalPoint) != 10) {
            toast.error("Error", {
                description: "Total point of all problem in your exam must be 10",
                variant: "destructive"
            });

        }
        else {
            updateFormData(currentValues, 'problems');
            if (onNext) onNext(values)
        }
    }

    const handleProblemsChange = (
        newValues
    ) => {
        let problemExcluded = [];
        for (let value of newValues) {
            problemExcluded.push(value.problemLink);
        }
        setSelectedProblems(problemExcluded);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <h2 className="text-2xl font-bold">Exam Problems</h2>

                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="languageSupports"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Language Supports</FormLabel>
                                <FormControl>
                                    <MultiSelect
                                        options={availableLanguages.map((lang) => ({ label: lang, value: lang }))}
                                        selected={field.value || []}
                                        onChange={field.onChange}
                                        placeholder="Select supported languages..."
                                    />
                                </FormControl>
                                <p className="text-sm text-muted-foreground mt-1 ">
                                    Select languages that will be supported for this problem
                                </p>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div style={{ marginTop: '30px' }}>
                        <div className="flex ">
                            <div>
                                <p className="font-semibold">
                                    Problem List
                                </p>
                            </div>
                            <div className="ml-2">
                                <svg onClick={addProblem} class="h-6 w-6 text-black-500 cursor-pointer" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <circle cx="12" cy="12" r="9" />  <line x1="9" y1="12" x2="15" y2="12" />  <line x1="12" y1="9" x2="12" y2="15" /></svg>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            Add problems to the exam as questions along with their points.
                        </p>
                    </div>
                    {form.watch("problems").map((problem, index) => (
                        <div key={index} className="flex md:flex-row gap-4 items-end">
                            <div className="w-full md:w-1/2">
                                <FormField
                                    control={form.control}
                                    name={`problems.${index}.problemLink`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Problem</FormLabel>
                                            <Select
                                                onValueChange={(value) => field.onChange(String(value))}
                                                value={field.value ? String(field.value) : undefined}
                                            >
                                                <FormControl>
                                                    <SelectTrigger style={{ height: "44px !important" }} className="h-10">
                                                        <SelectValue placeholder="Select problem" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {problemList.map((problemValue) => (
                                                        <SelectItem key={problemValue.id} disabled={selectedProblems.includes(problemValue.link) && field.value !== problemValue.link} value={String(problemValue.link)}>
                                                            {problemValue.title}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="w-full md:w-1/2">

                                <FormField
                                    control={form.control}
                                    name={`problems.${index}.points`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Point</FormLabel>
                                            <Input min="0" max="10" type="number"  {...field} />

                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeProblem(index)}
                                className="h-10 w-10 cursor-pointer"
                                disabled={form.watch("problems").length <= 1}
                            >
                                <Trash2 className="h-5 w-5 cursor-pointer" />
                                <span className="sr-only">Remove problem</span>
                            </Button>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={onPrevious} className="flex items-center">
                        <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                    </Button>
                    <Button type="submit" className="flex items-center">
                        Save
                        <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </form>
        </Form>
    );
}