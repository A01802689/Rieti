import { EmailForm } from './components/EmailForm';
import { RecoveryCard } from './components/RecoveryCard';

const RecoveryPage = () => (
    <RecoveryCard
        title="Recuperar contraseña"
        description="Ingresa tu correo y te enviaremos un código o enlace para restablecerla."
    >
        <EmailForm />
    </RecoveryCard>
);

export default RecoveryPage;
