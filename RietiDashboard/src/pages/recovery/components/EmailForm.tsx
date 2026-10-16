/** Form that asks for the email to send the recovery code or link to (UI only, no submit logic yet) */
export function EmailForm() {
    return (
        <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
                e.preventDefault();
                // TODO: ask the API to send the recovery email, then go to /recovery/token
            }}
        >
            <div>
                <label htmlFor="recovery-email" className="text-clear">
                    Correo electrónico
                </label>
                <input
                    id="recovery-email"
                    type="email"
                    placeholder="ejemplo@mail.com"
                    autoComplete="email"
                    className="input-field px-2 font-medium"
                />
            </div>

            <button type="submit" className="btn-primary w-full rounded-lg p-2 text-base font-medium">
                Enviar instrucciones
            </button>
        </form>
    );
}
