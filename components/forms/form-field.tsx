import { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { CheckCircle } from "lucide-react";

interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  completed?: boolean;
  children: ReactNode;
  description?: string;
}

export function FormField({
  id,
  label,
  required = false,
  error,
  completed = false,
  children,
  description
}: FormFieldProps) {
  return (
    <div className="space-y-3 group">
      <div className="flex items-center gap-2">
        <Label htmlFor={id} className="text-spotify-lightgray font-medium">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </Label>
        {completed && (
          <CheckCircle className="h-4 w-4 text-spotify-green" />
        )}
      </div>
      
      {children}
      
      {error && (
        <p className="text-red-400 text-sm animate-pulse">{error}</p>
      )}
      
      {description && !error && (
        <p className="text-xs text-spotify-lightgray">{description}</p>
      )}
    </div>
  );
}
