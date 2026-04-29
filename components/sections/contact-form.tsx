"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { animate } from "animejs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Enter a valid email address."),
  project_type: z.string().min(1, "Please choose a project type."),
  budget: z.string().min(1, "Please choose a budget range."),
  subject: z.string().min(3, "Subject must be at least 3 characters."),
  message: z.string().min(20, "Message must be at least 20 characters."),
});

type ContactFormValues = z.infer<typeof contactSchema>;

interface ContactFormProps {
  initialSubject?: string;
}

export function ContactForm({ initialSubject = "" }: ContactFormProps) {
  const [notice, setNotice] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);
  const successRef = useRef<HTMLDivElement | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      project_type: "",
      budget: "",
      subject: initialSubject,
      message: "",
    },
  });

  useEffect(() => {
    setValue("subject", initialSubject || "");
  }, [initialSubject, setValue]);

  useEffect(() => {
    if (!submitted || !successRef.current) {
      return;
    }

    animate(successRef.current, {
      scale: [0.7, 1],
      opacity: [0, 1],
      duration: 450,
      ease: "out(3)",
    });
  }, [submitted]);

  const onSubmit = async (values: ContactFormValues) => {
    setNotice("");
    setSubmitted(false);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Could not send inquiry.");
      }

      reset({
        name: "",
        email: "",
        project_type: "",
        budget: "",
        subject: initialSubject || "",
        message: "",
      });
      setNotice("Your inquiry has been sent. I will get back to you soon.");
      setSubmitted(true);
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Something went wrong. Try again."
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-2xl border border-border bg-card/70 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm text-muted-foreground">
            Name
          </label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Your full name"
          />
          {errors.name ? <p className="text-xs text-red-400">{errors.name.message}</p> : null}
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm text-muted-foreground">
            Email
          </label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            placeholder="you@example.com"
          />
          {errors.email ? <p className="text-xs text-red-400">{errors.email.message}</p> : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="project_type" className="text-sm text-muted-foreground">
            Project Type
          </label>
          <select
            id="project_type"
            {...register("project_type")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            defaultValue=""
          >
            <option value="" disabled>
              Select project type
            </option>
            <option value="Commercial">Commercial</option>
            <option value="Music Video">Music Video</option>
            <option value="Documentary">Documentary</option>
            <option value="Social Media">Social Media</option>
            <option value="Motion Graphics">Motion Graphics</option>
          </select>
          {errors.project_type ? (
            <p className="text-xs text-red-400">{errors.project_type.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <label htmlFor="budget" className="text-sm text-muted-foreground">
            Budget Range
          </label>
          <select
            id="budget"
            {...register("budget")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            defaultValue=""
          >
            <option value="" disabled>
              Select budget range
            </option>
            <option value="Under $300">Under $300</option>
            <option value="$300 - $1,000">$300 - $1,000</option>
            <option value="$1,000 - $3,000">$1,000 - $3,000</option>
            <option value="$3,000+">$3,000+</option>
          </select>
          {errors.budget ? <p className="text-xs text-red-400">{errors.budget.message}</p> : null}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="subject" className="text-sm text-muted-foreground">
          Subject
        </label>
        <Input id="subject" {...register("subject")} placeholder="Campaign edit support" />
        {errors.subject ? <p className="text-xs text-red-400">{errors.subject.message}</p> : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="text-sm text-muted-foreground">
          Message
        </label>
        <Textarea
          id="message"
          {...register("message")}
          placeholder="Tell me about your timeline, deliverables, and goals."
        />
        {errors.message ? <p className="text-xs text-red-400">{errors.message.message}</p> : null}
      </div>

      {notice ? <p className="text-sm text-brand">{notice}</p> : null}

      {submitted ? (
        <div ref={successRef} className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1.5 text-sm text-emerald-300 opacity-0">
          <Check className="h-4 w-4" />
          Inquiry submitted
        </div>
      ) : null}

      <Button type="submit" variant="brand" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? "Sending..." : "Send Inquiry"}
      </Button>
    </form>
  );
}
