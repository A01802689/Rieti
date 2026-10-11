// Stroke icons for the case page cards (lucide-style paths, inherit the text color)
/**
 * Shared wrapper of the icons
 *
 * @param children - Paths of the icon
 */
const Svg = ({ children }: { children: React.ReactNode }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
        {children}
    </svg>
);

export const UserIcon = () => (
    <Svg>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
    </Svg>
);

export const DocumentIcon = () => (
    <Svg>
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
        <path d="M14 3v5h5M9 13h6M9 17h6" />
    </Svg>
);

export const PlusIcon = () => (
    <Svg>
        <path d="M12 5v14M5 12h14" />
    </Svg>
);

export const PencilIcon = () => (
    <Svg>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </Svg>
);

export const InfoIcon = () => (
    <Svg>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 8h.01" />
    </Svg>
);

export const ListIcon = () => (
    <Svg>
        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </Svg>
);
