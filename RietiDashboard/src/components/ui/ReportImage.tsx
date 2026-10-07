import { useState } from 'react';

interface Props {
    src: string | null;
    alt: string;
    className?: string;
}

// Report photo with a placeholder when there is none or it fails to load
export function ReportImage({ src, alt, className = 'h-48' }: Props) {
    const [failed, setFailed] = useState(false);

    if (!src || failed) {
        return (
            <div className={`flex w-full items-center justify-center rounded-lg bg-component font-diffuse text-sm ${className}`}>
                {src ? 'Imagen no disponible' : 'Sin imagen'}
            </div>
        );
    }

    return (
        <a href={src} target="_blank" rel="noreferrer" className="block">
            <img
                src={src}
                alt={alt}
                loading="lazy"
                onError={() => setFailed(true)}
                className={`w-full rounded-lg object-cover ${className}`}
            />
        </a>
    );
}
