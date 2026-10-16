import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Props {
    title: string;
    description: string;
    children: ReactNode;
}

export function RecoveryCard({ title, description, children }: Props) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-page p-4 transition-colors duration-300">
            <main className="w-full max-w-md rounded-xl bg-card p-6 shadow-sm transition-colors duration-300 sm:p-10">
                <h1>{title}</h1>
                <p className="font-sight">{description}</p>

                <div className="mt-4">{children}</div>

                <Link to="/login" className="mt-6 block text-center text-sm font-accent hover:underline">
                    ← Volver a iniciar sesión
                </Link>
            </main>
        </div>
    );
}
