import { useTheme } from "next-themes";
import { Palette } from "lucide-react";

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
    <button onClick={() => toggleTheme()} className="relative">
      <Palette />
    </button>
  );
};

export default ThemeChanger;
