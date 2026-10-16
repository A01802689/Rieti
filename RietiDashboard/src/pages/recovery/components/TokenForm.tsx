/** Form to type the recovery code and choose the new password (UI only, no submit logic yet) */
export function TokenForm() {
    return (
        <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
                e.preventDefault();
                // TODO: send the code and the new password to the API, then go to /login
            }}
        >
            <div>
                <label htmlFor="recovery-token" className="text-clear">
                    Código de verificación
                </label>
                <input
                    id="recovery-token"
                    type="text"
                    inputMode="numeric"
                    placeholder="000000"
                    autoComplete="one-time-code"
                    className="input-field px-2 text-center font-mono tracking-widest"
                />
            </div>

            <div>
                <label htmlFor="recovery-password" className="text-clear">
                    Nueva contraseña
                </label>
                <input
                    id="recovery-password"
                    type="password"
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
                    placeholder="Repite la contraseña"
                    autoComplete="new-password"
                    className="input-field px-2 font-medium"
                />
            </div>

            <button type="submit" className="btn-primary w-full rounded-lg p-2 text-base font-medium">
                Cambiar contraseña
            </button>
            <button type="button" className="btn-secondary w-full rounded-lg p-2 text-sm">
                Reenviar código
            </button>
        </form>
    );
}
