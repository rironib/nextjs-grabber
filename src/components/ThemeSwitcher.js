"use client";

import {useIsSSR} from "@react-aria/ssr";
import {useTheme} from "next-themes";
import {RiMoonFill, RiSunFill} from "react-icons/ri";

export const ThemeSwitcher = () => {
    const isSSR = useIsSSR();
    const {theme, setTheme} = useTheme();

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };

    return (
        <button onClick={toggleTheme} aria-label="Theme Switcher" className="cursor-pointer rounded-lg p-1 transition-opacity hover:opacity-80">
            {isSSR || theme === "dark" ? <RiMoonFill size={22}/> : <RiSunFill size={22}/>}
        </button>
    );
};