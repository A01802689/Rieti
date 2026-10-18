import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { RecoveryMethod } from '@/lib/types/Recovery';
import { useRequestRecovery } from '../useRecovery';

const METHODS: { value: RecoveryMethod; label: string; hint: string }[] = [
    { value: 'code', label: 'Código', hint: 'Te enviamos 6 dígitos para escribir aquí' },
    { value: 'link', label: 'Enlace', hint: 'Te enviamos un enlace para abrir' },
];

/** Step 1: asks for the email and how to receive the instructions; with a code it goes on to /recovery/token */
export function EmailForm() {
    const navigate = useNavigate();
    const { run, loading, error } = useRequestRecovery();
    const [email, setEmail] = useState('');
    const [method, setMethod] = useState<RecoveryMethod>('code');
    const [linkSent, setLinkSent] = useState(false);

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const ok = await run({ email: email.trim(), method });
        if (!ok) return;
        // with a code the user types it in the next page, so it needs the email; with a link the email has everything
        if (method === 'code') navigate('/recovery/token', { state: { email: email.trim() } });
        else setLinkSent(true);
    };

    if (linkSent) {
        return (
            <p className="rounded-lg bg-component p-3 text-center" role="status">
                Si el correo está registrado, te enviamos un enlace para recuperar tu contraseña. Revisa tu bandeja de
                entrada.
            </p>
        );
    }

    return (
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
            <div>
                <label htmlFor="recovery-email" className="text-clear">
                    Correo electrónico
                </label>
                <input
                    id="recovery-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@mail.com"
                    autoComplete="email"
                    className="input-field px-2 font-medium"
                />
            </div>

            <fieldset className="flex flex-col gap-2">
                <legend className="text-clear">¿Cómo quieres recuperarla?</legend>
                {METHODS.map((m) => (
                    <label key={m.value} className="flex cursor-pointer items-start gap-2 rounded-lg bg-component p-3">
                        <input
                            type="radio"
                            name="recovery-method"
                            value={m.value}
                            checked={method === m.value}
                            onChange={() => setMethod(m.value)}
                            className="mt-1 !w-auto"
                        />
                        <span>
                            <span className="font-medium font-clear">{m.label}</span>
                            <span className="block text-xs font-diffuse">{m.hint}</span>
                        </span>
                    </label>
                ))}
            </fieldset>

            {error && (
                <span className="text-xs text-red-500" role="alert">
                    {error}
                </span>
            )}

            <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full rounded-lg p-2 text-base font-medium disabled:cursor-not-allowed disabled:opacity-60"
            >
                {loading ? 'Enviando...' : 'Enviar instrucciones'}
            </button>
        </form>
    );
}
