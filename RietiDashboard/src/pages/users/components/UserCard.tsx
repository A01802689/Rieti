import Card from "./Card"
import type { User } from "@/lib/types/User"
import { formatDateTime } from "@/lib/utilities/reportStyles"

type UserCardProps = {
  /** User shown */
  user: User
  /** Called when the card or its profile button is clicked */
  onOpen: () => void
}

/** Card with the name, email, role, municipio and last access of a user */
export const UserCard = ({ user, onOpen }: UserCardProps) => (
  <Card onClick={onOpen} className="flex cursor-pointer flex-col gap-2 p-5 hover:shadow-md">
    <p className="font-clear font-semibold">{user.nombre} {user.apellido}</p>
    <p className="font-diffuse text-sm">{user.correo}</p>
    <div>
      <span className="btn-secondary rounded-full px-3 py-0.5 text-xs">{user.rol}</span>
    </div>
    <p className="font-diffuse text-sm">Municipio: {user.municipio?.nombre ?? "Sin municipio"}</p>
    <p className="font-diffuse text-sm">Último acceso: {user.ultimo_acceso ? formatDateTime(user.ultimo_acceso) : "Sin registro"}</p>
    <div className="mt-2 flex justify-end border-t border-card pt-3">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onOpen()
        }}
        className="font-accent text-sm font-medium"
      >
        Ver perfil →
      </button>
    </div>
  </Card>
)
