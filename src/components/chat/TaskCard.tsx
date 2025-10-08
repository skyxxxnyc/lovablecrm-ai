import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: string;
  due_date?: string;
  created_at: string;
}

interface TaskCardProps {
  task: Task;
}

export const TaskCard = ({ task }: TaskCardProps) => {
  const priorityColors = {
    low: 'bg-blue-500',
    medium: 'bg-yellow-500',
    high: 'bg-red-500'
  };

  const isCompleted = task.status === 'completed';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            {isCompleted ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <Circle className="h-4 w-4" />
            )}
            {task.title}
          </CardTitle>
          <Badge 
            variant="secondary" 
            className={`${priorityColors[task.priority]} text-white`}
          >
            {task.priority}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}
        {task.due_date && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
          </div>
        )}
        <Badge variant="outline">{task.status}</Badge>
      </CardContent>
    </Card>
  );
};
