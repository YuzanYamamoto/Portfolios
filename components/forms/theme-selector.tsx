import { Badge } from "@/components/ui/badge";
import { THEME_EXAMPLES } from "@/constants";

interface ThemeSelectorProps {
  onThemeSelect: (theme: string) => void;
}

export function ThemeSelector({ onThemeSelect }: ThemeSelectorProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-spotify-lightgray">
        おすすめテーマ:
      </p>
      <div className="flex flex-wrap gap-2">
        {THEME_EXAMPLES.map((example, index) => (
          <Badge
            key={example}
            variant="secondary"
            className="cursor-pointer bg-gradient-to-r from-spotify-gray to-spotify-lightdark text-spotify-lightgray hover:from-spotify-green hover:to-green-400 hover:text-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            onClick={() => onThemeSelect(example)}
            style={{
              animationDelay: `${index * 100}ms`
            }}
          >
            {example}
          </Badge>
        ))}
      </div>
    </div>
  );
}
