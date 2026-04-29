"use client";

import { type ChangeEvent, type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface FormState {
  name: string;
  email: string;
  subject: string;
  project_type: string;
  budget: string;
  message: string;
}

const initialState: FormState = {
  name: "",
  email: "",
  subject: "",
  project_type: "",
  budget: "",
  message: "",
};

export function ContactForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<string>("");

  const onChange =
    (field: keyof FormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
    };

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setNotice("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Could not send inquiry.");
      }

      setForm(initialState);
      setNotice("Your inquiry has been sent. I will get back to you soon.");
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Something went wrong. Try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-border bg-card/70 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm text-muted-foreground">
            Name
          </label>
          <Input
            id="name"
            value={form.name}
            onChange={onChange("name")}
            required
            placeholder="Your full name"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm text-muted-foreground">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={onChange("email")}
            required
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="subject" className="text-sm text-muted-foreground">
            Subject
          </label>
          <Input
            id="subject"
            value={form.subject}
            onChange={onChange("subject")}
            placeholder="Campaign edit support"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="project_type" className="text-sm text-muted-foreground">
            Project Type
          </label>
          <Input
            id="project_type"
            value={form.project_type}
            onChange={onChange("project_type")}
            placeholder="Commercial, reels, music video..."
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="budget" className="text-sm text-muted-foreground">
          Budget Range
        </label>
        <Input
          id="budget"
          value={form.budget}
          onChange={onChange("budget")}
          placeholder="$500 - $1,500"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="text-sm text-muted-foreground">
          Message
        </label>
        <Textarea
          id="message"
          value={form.message}
          onChange={onChange("message")}
          required
          placeholder="Tell me about your timeline, deliverables, and goals."
        />
      </div>

      {notice ? <p className="text-sm text-brand">{notice}</p> : null}

      <Button type="submit" variant="brand" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? "Sending..." : "Send Inquiry"}
      </Button>
    </form>
  );
}
