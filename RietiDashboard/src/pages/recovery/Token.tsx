import { RecoveryCard } from './components/RecoveryCard';
import { TokenForm } from './components/TokenForm';

/** Step 2 of the password recovery: type the code received by email and choose the new password */
const TokenPage = () => (
    <RecoveryCard
        title="Restablecer contraseña"
        description="Escribe el código que enviamos a tu correo (o abre el enlace del correo) y elige tu nueva contraseña."
    >
        <TokenForm />
    </RecoveryCard>
);

export default TokenPage;
