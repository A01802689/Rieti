import type { User } from "../types/User"
import { ALL_PERMISSION_KEYS } from "@/lib/types/Permission"
import { municipios } from "./municipios"

// this one works as api fetcher
// here will be the fetch done

/** Simulates the users endpoint; it will become a fetch */
export const getUsers = async (): Promise<User[]> => users

/**
 * Finds a municipio by id
 *
 * @param id - id_municipio to look for
 * @returns The municipio, or null when it does not exist
 */
const mun = (id: number) => municipios.find((m) => m.id_municipio === id) ?? null

/** Hardcoded users used while the endpoint does not exist */
export const users: User[] = [
  {
    id_usuario: 1, nombre: "Juan Manuel", apellido: "Sánchez Valaz", correo: "jsanchez@atizapan.gob.mx",
    rol: "Administrador", id_municipio: 1, municipio: mun(1),
    ultimo_acceso: "2026-10-08T09:12:40-06:00", permisos: ALL_PERMISSION_KEYS,
    actividad: { reportes_atendidos: 48, casos_revisados: 31, notas_registradas: 56 },
  },
  {
    id_usuario: 2, nombre: "María Fernanda", apellido: "Hernández Ruiz", correo: "mhernandez@atizapan.gob.mx",
    rol: "Administrador", id_municipio: 1, municipio: mun(1),
    ultimo_acceso: "2026-10-07T17:45:03-06:00", permisos: ALL_PERMISSION_KEYS,
    actividad: { reportes_atendidos: 22, casos_revisados: 40, notas_registradas: 35 },
  },
  {
    id_usuario: 3, nombre: "Carlos Alberto", apellido: "Ramírez Torres", correo: "cramirez@atizapan.gob.mx",
    rol: "Alimentador", id_municipio: 1, municipio: mun(1),
    ultimo_acceso: "2026-10-08T08:30:15-06:00",
    permisos: ["reports.view", "reports.view_detail", "reports.edit", "cases.view", "map.view"],
    actividad: { reportes_atendidos: 63, casos_revisados: 12, notas_registradas: 27 },
  },
  {
    id_usuario: 4, nombre: "Ana Lucía", apellido: "González Méndez", correo: "agonzalez@naucalpan.gob.mx",
    rol: "Alimentador", id_municipio: 2, municipio: mun(2),
    ultimo_acceso: "2026-10-06T12:05:51-06:00",
    permisos: ["reports.view", "reports.view_detail", "cases.view", "cases.edit", "map.view", "stats.view"],
    actividad: { reportes_atendidos: 18, casos_revisados: 25, notas_registradas: 41 },
  },
  {
    id_usuario: 5, nombre: "Luis Enrique", apellido: "Martínez Cruz", correo: "lmartinez@tlalnepantla.gob.mx",
    rol: "Alimentador", id_municipio: 3, municipio: mun(3),
    ultimo_acceso: "2026-10-03T15:20:09-06:00",
    permisos: ["reports.view", "map.view"],
    actividad: { reportes_atendidos: 9, casos_revisados: 4, notas_registradas: 6 },
  },
  {
    id_usuario: 6, nombre: "Patricia", apellido: "López Domínguez", correo: "plopez@cuautitlanizcalli.gob.mx",
    rol: "Alimentador", id_municipio: 4, municipio: mun(4),
    ultimo_acceso: "2026-09-28T10:41:27-06:00",
    permisos: ["reports.view", "reports.view_detail", "reports.edit", "reports.close", "cases.view", "cases.edit", "cases.close", "cases.assign", "map.view", "data.export"],
    actividad: { reportes_atendidos: 74, casos_revisados: 38, notas_registradas: 92 },
  },
  {
    id_usuario: 7, nombre: "Roberto", apellido: "Flores Aguilar", correo: "rflores@nicolasromero.gob.mx",
    rol: "Alimentador", id_municipio: 5, municipio: mun(5),
    ultimo_acceso: "2026-09-15T19:02:44-06:00",
    permisos: ["reports.view", "cases.view", "stats.view", "logs.view"],
    actividad: { reportes_atendidos: 5, casos_revisados: 17, notas_registradas: 11 },
  },
  {
    id_usuario: 8, nombre: "Sofía", apellido: "Castillo Vega", correo: "scastillo@isidrofabela.gob.mx",
    rol: "Alimentador", id_municipio: 6, municipio: mun(6),
    ultimo_acceso: null,
    permisos: ["reports.view", "map.view"],
    actividad: { reportes_atendidos: 0, casos_revisados: 0, notas_registradas: 0 },
  },
  {
    id_usuario: 9, nombre: "Diego", apellido: "Morales Pineda", correo: "dmorales@atizapan.gob.mx",
    rol: "Alimentador", id_municipio: 1, municipio: mun(1),
    ultimo_acceso: "2026-10-05T07:55:30-06:00",
    permisos: ["reports.view", "reports.view_detail", "reports.edit", "cases.view", "cases.edit", "map.view", "stats.view"],
    actividad: { reportes_atendidos: 34, casos_revisados: 21, notas_registradas: 29 },
  },
]
