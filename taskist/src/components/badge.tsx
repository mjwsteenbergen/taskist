import { VariantProps, cva } from "class-variance-authority";
import { MouseEventHandler, PropsWithChildren } from "react";



const map = {
    "berry_red": "bg-red-200",
    // "light_blue": "#96c3eb",
    "red": "bg-red-200",
    "blue": "bg-blue-400",
    // "orange": "#ff9933",
    // "grape": "#884dff",
    // "yellow": "#fad000",
    // "violet": "#af38eb",
    // "olive_green": "#afb83b",
    // "lavender": "#eb96eb",
    // "lime_green": "#7ecc49",
    // "magenta": "#e05194",
    // "green": "#299438",
    // "salmon": "#ff8d85",
    // "mint_green": "#6accbc",
    // "charcoal": "#808080",
    // "teal": "#158fad",
    // "grey": "#b8b8b8",
    // "sky_blue": "#14aaf5",
    // "taupe": "#ccac93",
}

const mapToColor = (color: (keyof typeof map) | string): string => {
    return (map as any)[color] ?? "bg-red-400";
}

const variant = cva("text-xs p-1 pt-[6px] px-2 rounded-md text-white flex", {
    variants: {
        color: {
            "berry_red": "bg-red-200",
            // "light_blue": "#96c3eb",
            "red": "bg-red-200",
            "blue": "bg-blue-400",
            // "orange": "#ff9933",
            // "grape": "#884dff",
            // "yellow": "#fad000",
            // "violet": "#af38eb",
            // "olive_green": "#afb83b",
            // "lavender": "#eb96eb",
            // "lime_green": "#7ecc49",
            // "magenta": "#e05194",
            // "green": "#299438",
            // "salmon": "#ff8d85",
            // "mint_green": "#6accbc",
            // "charcoal": "#808080",
            // "teal": "#158fad",
            // "grey": "#b8b8b8",
            // "sky_blue": "#14aaf5",
            // "taupe": "#ccac93",
        }
    },
    defaultVariants: {
        color: "red"
    }
})

type PProps = {
    name?: string;
    color?: VariantProps<typeof variant>['color'];
    link?: string;
    onClick?: MouseEventHandler<HTMLAnchorElement>;
}

export const Badge = ({ name, color, link, onClick, children }: PropsWithChildren<PProps>) => {
    const className = variant({ color });
    if (link) {
        return <a href={link} target="_blank" onClick={onClick} className={className + " reset"}>{name ?? children}</a>
    } else
        return <span className={className} onClick={onClick}>
            {name ?? children}
        </span>
}