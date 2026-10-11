import { useState } from 'react';

interface Props {
    /** URL of the photo, null when the report has none */
    src: string | null;
    /** Alternative text of the image */
    alt: string;
    /** Classes of the image or placeholder; the default sets the height */
    className?: string;
}

/** Report photo, with a placeholder when there is none or it fails to load */
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
