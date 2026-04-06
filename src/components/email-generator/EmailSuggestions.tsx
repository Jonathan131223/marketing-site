import React from "react";
import { UseCase } from "@/types/emailGenerator";
import { getSuggestedUseCases } from "@/utils/useCaseMapping";
import { Button } from "@/components/ui/button";

interface EmailSuggestionsProps {
  currentUseCase: UseCase | null;
  onSelectUseCase: (useCase: UseCase) => void;
}

export const EmailSuggestions: React.FC<EmailSuggestionsProps> = ({
  currentUseCase,
  onSelectUseCase,
}) => {
  const suggestions = getSuggestedUseCases(currentUseCase);

  if (suggestions.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border border-border p-6 mt-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Create More Emails Like This
        </h3>
        <p className="text-muted-foreground">
          Keep the momentum going with these related email types
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="bg-muted/20 rounded-lg p-4 border border-border/50 hover:border-primary/20 hover:bg-muted/30 transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="text-2xl mb-3">{suggestion.icon}</div>
              <h4 className="text-base font-semibold text-foreground mb-2">
                {suggestion.title}
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {suggestion.summary}
              </p>
            </div>
            <Button
              onClick={() => onSelectUseCase(suggestion.id)}
              variant="outline"
              size="sm"
              className="w-full mt-4"
            >
              Create this email
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
