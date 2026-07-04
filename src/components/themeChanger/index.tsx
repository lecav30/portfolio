import { useTheme } from "next-themes";
import { Palette } from "lucide-react";
import { useEffect } from "react";

const ThemeChanger = () => {
  const { resolvedTheme, theme, setTheme } = useTheme();

  useEffect(() => {
    if (theme) {
      document.cookie = `theme=${theme}; Path=/; Max-Age=31536000; SameSite=Lax`;
    }
  }, [theme]);

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="relative"
      aria-label="Toggle color theme"
    >
      <Palette />
    </button>
  );
};

export default ThemeChanger;
