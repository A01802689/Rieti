import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useRequestRecovery, useResetPassword } from '../useRecovery';

const MIN_PASSWORD = 8;

/**
 * Step 2: choose the new password.
 * Opened from the email link (?token=...) it only asks for the password; opened after step 1 it also asks for
 * the 6-digit code (and the email, which comes prefilled from step 1).
 */
export function TokenForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const [params] = useSearchParams();
    const token = params.get('token') ?? undefined;
    const isLink = token !== undefined;

    const reset = useResetPassword();
    const resend = useRequestRecovery();

    const [email, setEmail] = useState((location.state as { email?: string } | null)?.email ?? '');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [formError, setFormError] = useState<string | null>(null);
    const [resent, setResent] = useState(false);
    const [done, setDone] = useState(false);

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setFormError(null);
        if (!isLink && !/^\d{6}$/.test(code)) return setFormError('El código tiene 6 dígitos.');
        if (password.length < MIN_PASSWORD) return setFormError(`La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`);
        if (password.length > 72) return setFormError('La contraseña no puede tener más de 72 caracteres.');
        if (password !== confirm) return setFormError('Las contraseñas no coinciden.');

        if (await reset.run({ token, email: email.trim(), code, newPassword: password })) setDone(true);
    };

    const onResend = async () => {
        setResent(false);
        if (await resend.run({ email: email.trim(), method: 'code' })) setResent(true);
    };

    if (done) {
        return (
            <div className="flex flex-col gap-4">
                <p className="rounded-lg bg-component p-3 text-center" role="status">
                    Tu contraseña se actualizó. Ya puedes iniciar sesión.
                </p>
                <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="btn-primary w-full rounded-lg p-2 text-base font-medium"
                >
                    Ir a iniciar sesión
                </button>
            </div>
        );
    }

    const error = formError ?? reset.error;

    return (
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
            {!isLink && (
                <>
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
                            autoComplete="email"
                            className="input-field px-2 font-medium"
                        />
                    </div>

                    <div>
                        <label htmlFor="recovery-token" className="text-clear">
                            Código de verificación
                        </label>
                        <input
                            id="recovery-token"
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            required
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                            placeholder="000000"
                            autoComplete="one-time-code"
                            className="input-field px-2 text-center font-mono tracking-widest"
                        />
                    </div>
                </>
            )}

            <div>
                <label htmlFor="recovery-password" className="text-clear">
                    Nueva contraseña
                </label>
                <input
                    id="recovery-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tu nueva contraseña"
                    autoComplete="new-password"
                    className="input-field px-2 font-medium"
                />
            </div>

            <div>
                <label htmlFor="recovery-password-confirm" className="text-clear">
                    Confirmar contraseña
                </label>
                <input
                    id="recovery-password-confirm"
                    type="password"
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repite la contraseña"
                    autoComplete="new-password"
                    className="input-field px-2 font-medium"
                />
            </div>

            {error && (
                <span className="text-xs text-red-500" role="alert">
                    {error}
                </span>
            )}

            <button
                type="submit"
                disabled={reset.loading}
                className="btn-primary w-full rounded-lg p-2 text-base font-medium disabled:cursor-not-allowed disabled:opacity-60"
            >
                {reset.loading ? 'Guardando...' : 'Cambiar contraseña'}
            </button>

            {!isLink && (
                <>
                    <button
                        type="button"
                        onClick={onResend}
                        disabled={resend.loading || !email.trim()}
                        className="btn-secondary w-full rounded-lg p-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {resend.loading ? 'Enviando...' : 'Reenviar código'}
                    </button>
                    {resent && (
                        <span className="text-center text-xs font-diffuse" role="status">
                            Si el correo está registrado, te enviamos un código nuevo.
                        </span>
                    )}
                    {resend.error && (
                        <span className="text-xs text-red-500" role="alert">
                            {resend.error}
                        </span>
                    )}
                </>
            )}
        </form>
    );
}
