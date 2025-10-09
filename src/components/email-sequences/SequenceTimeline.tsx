import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Mail } from "lucide-react";

interface SequenceStep {
  id: string;
  step_number: number;
  subject: string;
  body: string;
  delay_days: number;
  delay_hours: number;
}

interface SequenceTimelineProps {
  steps: SequenceStep[];
}

export const SequenceTimeline = ({ steps }: SequenceTimelineProps) => {
  if (steps.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No steps added yet</p>
        <p className="text-sm mt-2">Add steps to create your email sequence</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-6">
      {/* Vertical line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

      {steps.map((step, index) => {
        const totalHours = step.delay_days * 24 + step.delay_hours;
        const delayText = step.delay_days > 0 
          ? `${step.delay_days}d ${step.delay_hours}h`
          : step.delay_hours > 0 
            ? `${step.delay_hours}h`
            : 'Immediate';

        return (
          <div key={step.id} className="relative pl-16">
            {/* Circle marker */}
            <div className="absolute left-3 top-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center z-10">
              <span className="text-xs font-bold text-primary-foreground">
                {step.step_number}
              </span>
            </div>

            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <h4 className="font-semibold truncate">{step.subject}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {step.body}
                      </p>
                    </div>
                    <Badge variant="secondary" className="flex items-center gap-1 whitespace-nowrap">
                      <Clock className="h-3 w-3" />
                      {delayText}
                    </Badge>
                  </div>

                  {totalHours > 0 && index > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Sent {delayText} after previous email
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
};
