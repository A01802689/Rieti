import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { ALL_PERMISSION_KEYS, DEFAULT_INITIAL_PERMISSIONS, togglePermissionKey, type PermissionKey } from '@/lib/types/Permission'
import type { UserCreate } from '@/lib/types/User'
import { PasswordField } from '@/pages/users/components/PasswordField'
import { Toggle } from '@/pages/users/components/Toggle'
import { UserCard } from '@/pages/users/components/UserCard'
import { UserCreatePopup } from '@/pages/users/components/UserCreatePopup'
import { UserDetailPopup } from '@/pages/users/components/UserDetailPopup'
import { isValidPassword } from '@/lib/utilities/password'
import { makeStoredUser } from '../../helpers/fixtures'

describe('PasswordField', () => {
  const Harness = () => {
    const [value, setValue] = useState('')
    return <PasswordField value={value} onChange={setValue} />
  }

  it('marca cada requisito en vivo mientras se escribe', async () => {
    render(<Harness />)
    const pending = () => screen.getAllByText('(pendiente)').length
    expect(pending()).toBe(4)
    await userEvent.type(screen.getByLabelText('Contraseña *'), 'abcdefgh')
    expect(pending()).toBe(3)
    await userEvent.type(screen.getByLabelText('Contraseña *'), 'A')
    expect(pending()).toBe(2)
    await userEvent.type(screen.getByLabelText('Contraseña *'), '1')
    await userEvent.type(screen.getByLabelText('Contraseña *'), '!')
    expect(screen.queryByText('(pendiente)')).not.toBeInTheDocument()
    expect(screen.getAllByText('(cumplido)')).toHaveLength(4)
  })

  it('el botón muestra y oculta la contraseña', async () => {
    render(<Harness />)
    const input = screen.getByLabelText('Contraseña *')
    expect(input).toHaveAttribute('type', 'password')
    await userEvent.click(screen.getByRole('button', { name: 'Mostrar contraseña' }))
    expect(input).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: 'Ocultar contraseña' })).toHaveAttribute('aria-pressed', 'true')
  })
})

describe('Toggle', () => {
  it('es un switch con nombre accesible y llama a onChange', async () => {
    const onChange = vi.fn()
    render(<Toggle checked={false} onChange={onChange} label="Ver mapa" />)
    await userEvent.click(screen.getByRole('switch', { name: 'Ver mapa' }))
    expect(onChange).toHaveBeenCalledWith(true, expect.anything())
  })

  it('deshabilitado no cambia', async () => {
    const onChange = vi.fn()
    render(<Toggle checked onChange={onChange} label="x" disabled />)
    await userEvent.click(screen.getByRole('switch'))
    expect(onChange).not.toHaveBeenCalled()
  })
})

describe('UserCard', () => {
  it('muestra los datos del usuario', () => {
    render(<UserCard user={makeStoredUser()} onOpen={vi.fn()} />)
    expect(screen.getByText('Luis Gómez')).toBeInTheDocument()
    expect(screen.getByText('luis@correo.mx')).toBeInTheDocument()
    expect(screen.getByText('Municipio: Atizapán de Zaragoza')).toBeInTheDocument()
    expect(screen.getByText(/Último acceso: .*2026/)).toBeInTheDocument()
  })

  it('sin municipio ni acceso muestra los textos por defecto', () => {
    render(<UserCard user={makeStoredUser({ municipio: null, ultimo_acceso: null })} onOpen={vi.fn()} />)
    expect(screen.getByText('Municipio: Sin municipio')).toBeInTheDocument()
    expect(screen.getByText('Último acceso: Sin registro')).toBeInTheDocument()
  })

  it('el clic en la tarjeta y en Ver perfil abren una sola vez cada uno', async () => {
    const onOpen = vi.fn()
    render(<UserCard user={makeStoredUser()} onOpen={onOpen} />)
    await userEvent.click(screen.getByText('Luis Gómez'))
    expect(onOpen).toHaveBeenCalledTimes(1)
    await userEvent.click(screen.getByRole('button', { name: 'Ver perfil →' }))
    expect(onOpen).toHaveBeenCalledTimes(2)
  })
})

const baseForm = (overrides: Partial<UserCreate> = {}): UserCreate => ({
  nombre: '',
  apellido: '',
  correo: '',
  contrasena: '',
  rol: 'Alimentador',
  id_municipio: null,
  permisos: [...DEFAULT_INITIAL_PERMISSIONS],
  ...overrides,
})

const municipios = [
  { id_municipio: 1, nombre: 'Atizapán', clave: '013' },
  { id_municipio: 2, nombre: 'Naucalpan', clave: '057' },
]

/** Create popup connected to real state, so the dependencies between permissions can be followed */
function CreateHarness({ onSubmit = vi.fn(), initial = baseForm(), canSubmit = true, error = '', submitting = false, onClose = vi.fn() }: {
  onSubmit?: () => void
  initial?: UserCreate
  canSubmit?: boolean
  error?: string
  submitting?: boolean
  onClose?: () => void
}) {
  const [form, setForm] = useState(initial)
  return (
    <UserCreatePopup
      open
      onClose={onClose}
      form={form}
      onChange={(field, value) => setForm((prev) => ({ ...prev, [field]: value }))}
      onTogglePermission={(key: PermissionKey) => setForm((prev) => ({ ...prev, permisos: togglePermissionKey(prev.permisos, key) }))}
      municipios={municipios}
      canSubmit={canSubmit}
      onSubmit={onSubmit}
      submitting={submitting}
      error={error}
    />
  )
}

describe('UserCreatePopup', () => {
  it('muestra los permisos por defecto marcados y sin logs.view', () => {
    render(<CreateHarness />)
    expect(screen.getByRole('checkbox', { name: new RegExp('^Ver reportes') })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: new RegExp('^Ver mapa de calor') })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: new RegExp('^Ver casos') })).not.toBeChecked()
    expect(screen.queryByRole('checkbox', { name: 'Ver bitácora' })).not.toBeInTheDocument()
  })

  it('marcar un permiso dependiente marca también el que requiere', async () => {
    render(<CreateHarness />)
    await userEvent.click(screen.getByRole('checkbox', { name: new RegExp('^Cerrar casos') }))
    expect(screen.getByRole('checkbox', { name: new RegExp('^Cerrar casos') })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: new RegExp('^Ver casos') })).toBeChecked()
  })

  it('desmarcar el requerido desmarca los dependientes', async () => {
    render(<CreateHarness />)
    await userEvent.click(screen.getByRole('checkbox', { name: new RegExp('^Editar reportes') }))
    await userEvent.click(screen.getByRole('checkbox', { name: new RegExp('^Ver reportes') }))
    expect(screen.getByRole('checkbox', { name: new RegExp('^Editar reportes') })).not.toBeChecked()
  })

  it('muestra la nota de requisito', () => {
    render(<CreateHarness />)
    expect(screen.getAllByText('Requiere: Ver casos')).toHaveLength(3)
  })

  it('un Administrador tiene todos los permisos marcados y bloqueados', async () => {
    render(<CreateHarness initial={baseForm({ rol: 'Administrador', permisos: [] })} />)
    const boxes = screen.getAllByRole('checkbox')
    expect(boxes).toHaveLength(ALL_PERMISSION_KEYS.length - 1)
    boxes.forEach((box) => {
      expect(box).toBeChecked()
      expect(box).toHaveAttribute('aria-disabled', 'true')
    })
  })

  it('cambiar el rol a Administrador bloquea los permisos', async () => {
    render(<CreateHarness />)
    await userEvent.selectOptions(screen.getByLabelText('Rol del sistema *'), 'Administrador')
    expect(screen.getByRole('checkbox', { name: new RegExp('^Ver casos') })).toBeChecked()
  })

  it('escribe en los campos y elige municipio, o vuelve a "Seleccionar"', async () => {
    render(<CreateHarness />)
    await userEvent.type(screen.getByLabelText(/Nombre\(s\)/), 'Ana')
    expect(screen.getByLabelText(/Nombre\(s\)/)).toHaveValue('Ana')
    const select = screen.getByLabelText('Municipio asignado *')
    await userEvent.selectOptions(select, 'Naucalpan')
    expect(select).toHaveValue('2')
    await userEvent.selectOptions(select, 'Seleccionar')
    expect(select).toHaveValue('')
  })

  it('el botón Registrar está deshabilitado si el formulario no es válido o se está enviando', () => {
    const { rerender } = render(<CreateHarness canSubmit={false} />)
    expect(screen.getByRole('button', { name: 'Registrar usuario' })).toBeDisabled()
    rerender(<CreateHarness canSubmit submitting />)
    expect(screen.getByRole('button', { name: 'Registrando...' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
  })

  it('registrar y cancelar llaman a sus funciones y el error se muestra', async () => {
    const onSubmit = vi.fn()
    const onClose = vi.fn()
    render(<CreateHarness onSubmit={onSubmit} onClose={onClose} error="Correo ya existe" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Correo ya existe')
    await userEvent.click(screen.getByRole('button', { name: 'Registrar usuario' }))
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('la contraseña pasa por el campo con requisitos', async () => {
    render(<CreateHarness />)
    await userEvent.type(screen.getByLabelText('Contraseña *'), 'Abcdef1!')
    expect(isValidPassword('Abcdef1!')).toBe(true)
    expect(screen.queryByText('(pendiente)')).not.toBeInTheDocument()
  })
})

describe('UserDetailPopup', () => {
  const renderDetail = (props: Partial<React.ComponentProps<typeof UserDetailPopup>> = {}) => {
    const handlers = { onClose: vi.fn(), onTogglePermission: vi.fn(), onStartEditing: vi.fn(), onSave: vi.fn(), onDelete: vi.fn() }
    render(
      <UserDetailPopup
        user={makeStoredUser({ permisos: ['reports.view', 'reports.edit'] })}
        editing={false}
        draftPermissions={[]}
        confirmingDelete={false}
        busy={false}
        error=""
        {...handlers}
        {...props}
      />,
    )
    return handlers
  }

  it('cerrado cuando user es null', () => {
    renderDetail({ user: null })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('muestra los datos y los permisos que tiene, sin poder editar', () => {
    renderDetail()
    expect(screen.getByText('Luis Gómez')).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: 'Ver reportes' })).toBeChecked()
    expect(screen.getByRole('switch', { name: 'Ver casos' })).not.toBeChecked()
    expect(screen.getByRole('switch', { name: 'Ver reportes' })).toHaveAttribute('aria-disabled', 'true')
  })

  it('sin municipio ni acceso usa los textos por defecto', () => {
    renderDetail({ user: makeStoredUser({ municipio: null, ultimo_acceso: null }) })
    expect(screen.getByText(/Sin municipio · Último acceso: Sin registro/)).toBeInTheDocument()
  })

  it('un Administrador muestra todo marcado y bloqueado, sin botón de editar', () => {
    renderDetail({ user: makeStoredUser({ rol: 'Administrador', permisos: [] }), editing: true })
    const switches = screen.getAllByRole('switch')
    switches.forEach((s) => {
      expect(s).toBeChecked()
      expect(s).toHaveAttribute('aria-disabled', 'true')
    })
    expect(screen.queryByRole('button', { name: 'Editar permisos' })).not.toBeInTheDocument()
  })

  it('Editar permisos llama a onStartEditing', async () => {
    const handlers = renderDetail()
    await userEvent.click(screen.getByRole('button', { name: 'Editar permisos' }))
    expect(handlers.onStartEditing).toHaveBeenCalledTimes(1)
  })

  it('editando muestra el borrador y permite cambiar y guardar', async () => {
    const handlers = renderDetail({ editing: true, draftPermissions: ['map.view'] })
    expect(screen.getByRole('switch', { name: 'Ver mapa de calor' })).toBeChecked()
    expect(screen.getByRole('switch', { name: 'Ver reportes' })).not.toBeChecked()
    await userEvent.click(screen.getByRole('switch', { name: 'Ver casos' }))
    expect(handlers.onTogglePermission).toHaveBeenCalledWith('cases.view')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(handlers.onSave).toHaveBeenCalledTimes(1)
  })

  it('ocupado cambia los textos y bloquea los botones', () => {
    renderDetail({ editing: true, busy: true, confirmingDelete: true })
    expect(screen.getByRole('button', { name: 'Guardando...' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Eliminando...' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeDisabled()
  })

  it('el botón de eliminar cambia a Confirmar', async () => {
    const handlers = renderDetail({ confirmingDelete: true })
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar' }))
    expect(handlers.onDelete).toHaveBeenCalledTimes(1)
  })

  it('muestra el error', () => {
    renderDetail({ error: 'No se pudo' })
    expect(within(screen.getByRole('dialog')).getByRole('alert')).toHaveTextContent('No se pudo')
  })

  it('un usuario sin lista de permisos no rompe', () => {
    renderDetail({ user: { ...makeStoredUser(), permisos: undefined as never } })
    expect(screen.getByRole('switch', { name: 'Ver reportes' })).not.toBeChecked()
  })
})

