import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

const ThemeChanger = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  return (
    <div>
      <button onClick={() => toggleTheme()} className="relative">
        {theme === "dark" ? <Sun /> : <Moon />}
      </button>
    </div>
  );
};

export default ThemeChanger;
