import { describe, expect, it } from 'vitest'
import {
  ADMIN_ONLY_PERMISSIONS,
  ALL_PERMISSION_KEYS,
  DEFAULT_INITIAL_PERMISSIONS,
  grantPermission,
  PERMISSION_GROUPS,
  PERMISSION_REQUIRES,
  PERMISSIONS,
  permissionNote,
  permissionsByGroup,
  revokePermission,
  togglePermissionKey,
  type PermissionKey,
} from '@/lib/types/Permission'

const unknownKey = 'no.existe' as PermissionKey

describe('catálogo de permisos', () => {
  it('no repite claves', () => {
    expect(new Set(ALL_PERMISSION_KEYS).size).toBe(PERMISSIONS.length)
  })

  it('los permisos por defecto existen y no son exclusivos del administrador', () => {
    for (const key of DEFAULT_INITIAL_PERMISSIONS) {
      expect(ALL_PERMISSION_KEYS).toContain(key)
      expect(ADMIN_ONLY_PERMISSIONS).not.toContain(key)
    }
  })

  it('cada dependencia apunta a un permiso que existe y no hay ciclos', () => {
    for (const [key, required] of Object.entries(PERMISSION_REQUIRES)) {
      expect(ALL_PERMISSION_KEYS).toContain(key)
      expect(ALL_PERMISSION_KEYS).toContain(required)
      expect(PERMISSION_REQUIRES[required as PermissionKey]).toBeUndefined()
    }
  })

  it('logs.view es exclusivo del administrador', () => {
    expect(ADMIN_ONLY_PERMISSIONS).toEqual(['logs.view'])
  })
})

describe('permissionNote', () => {
  it('dice qué permiso requiere', () => {
    expect(permissionNote('reports.edit')).toBe('Requiere: Ver reportes')
    expect(permissionNote('cases.assign')).toBe('Requiere: Ver casos')
  })

  it('no da nota si no requiere nada', () => {
    expect(permissionNote('reports.view')).toBeUndefined()
    expect(permissionNote('map.view')).toBeUndefined()
  })

  it('no da nota con una clave desconocida', () => {
    expect(permissionNote(unknownKey)).toBeUndefined()
  })
})

describe('grantPermission', () => {
  it('agrega el permiso y el que requiere', () => {
    expect(grantPermission([], 'reports.close')).toEqual(['reports.close', 'reports.view'])
  })

  it('no repite lo que ya está', () => {
    expect(grantPermission(['reports.view'], 'reports.edit')).toEqual(['reports.view', 'reports.edit'])
    expect(grantPermission(['reports.view'], 'reports.view')).toEqual(['reports.view'])
  })

  it('no modifica la lista original', () => {
    const list: PermissionKey[] = []
    grantPermission(list, 'cases.edit')
    expect(list).toEqual([])
  })

  it('ignora los permisos exclusivos del administrador', () => {
    const list: PermissionKey[] = ['map.view']
    expect(grantPermission(list, 'logs.view')).toBe(list)
  })

  it('agrega una clave desconocida sin dependencias', () => {
    expect(grantPermission([], unknownKey)).toEqual([unknownKey])
  })

  it('agrega el requisito aunque el permiso ya esté', () => {
    expect(grantPermission(['cases.edit'], 'cases.edit')).toEqual(['cases.edit', 'cases.view'])
  })
})

describe('revokePermission', () => {
  it('quita el permiso', () => {
    expect(revokePermission(['map.view', 'stats.view'], 'map.view')).toEqual(['stats.view'])
  })

  it('quita también los que dependen de él', () => {
    const list: PermissionKey[] = ['cases.view', 'cases.edit', 'cases.close', 'cases.assign', 'map.view']
    expect(revokePermission(list, 'cases.view')).toEqual(['map.view'])
  })

  it('quitar un dependiente deja el permiso base', () => {
    expect(revokePermission(['reports.view', 'reports.edit'], 'reports.edit')).toEqual(['reports.view'])
  })

  it('no falla si el permiso no está', () => {
    expect(revokePermission(['map.view'], 'stats.view')).toEqual(['map.view'])
  })

  it('no modifica la lista original', () => {
    const list: PermissionKey[] = ['reports.view', 'reports.edit']
    revokePermission(list, 'reports.view')
    expect(list).toEqual(['reports.view', 'reports.edit'])
  })

  it('con una clave desconocida no cambia nada', () => {
    expect(revokePermission(['map.view'], unknownKey)).toEqual(['map.view'])
  })
})

describe('togglePermissionKey', () => {
  it('concede el que no está', () => {
    expect(togglePermissionKey([], 'cases.edit')).toEqual(['cases.edit', 'cases.view'])
  })

  it('revoca el que está, con sus dependientes', () => {
    expect(togglePermissionKey(['reports.view', 'reports.close'], 'reports.view')).toEqual([])
  })

  it('dos cambios seguidos regresan a la lista de partida', () => {
    const once = togglePermissionKey(['map.view'], 'stats.view')
    expect(togglePermissionKey(once, 'stats.view')).toEqual(['map.view'])
  })

  it('no concede logs.view', () => {
    expect(togglePermissionKey([], 'logs.view')).toEqual([])
  })
})

describe('permissionsByGroup', () => {
  it('tiene una columna por grupo', () => {
    expect(Object.keys(permissionsByGroup())).toEqual([...PERMISSION_GROUPS])
  })

  it('oculta los permisos exclusivos del administrador', () => {
    const keys = Object.values(permissionsByGroup()).flat().map((p) => p.key)
    expect(keys).not.toContain('logs.view')
    expect(keys).toHaveLength(PERMISSIONS.length - ADMIN_ONLY_PERMISSIONS.length)
  })

  it('cada permiso está en su grupo', () => {
    const groups = permissionsByGroup()
    for (const group of PERMISSION_GROUPS) {
      expect(groups[group].every((p) => p.group === group)).toBe(true)
    }
  })
})
