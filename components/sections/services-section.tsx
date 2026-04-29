import { Clock3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Service } from "@/lib/types";

interface ServicesSectionProps {
  services: Service[];
}

export function ServicesSection({ services }: ServicesSectionProps) {
  return (
    <section className="container space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold sm:text-4xl">Services</h2>
        <p className="max-w-2xl text-muted-foreground">
          Flexible production support across editing, motion graphics, and platform-ready
          content systems.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {services.map((service) => (
          <Card key={service.id} className="border-border/80 bg-card/70">
            <CardHeader className="space-y-3">
              <Badge variant="outline" className="w-fit">
                {service.price_range ?? "Custom Quote"}
              </Badge>
              <CardTitle>{service.title}</CardTitle>
              <CardDescription>
                {service.description ?? "Tailored support for your project goals."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Clock3 className="h-4 w-4" />
                Delivery: {service.delivery_days ?? 0} days
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {(service.features ?? []).map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-brand" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
