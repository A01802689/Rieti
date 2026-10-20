package mx.itesm.myapplication.data.network

import android.annotation.SuppressLint
import android.content.Context
import android.location.Address
import android.location.Geocoder
import android.location.Location
import android.os.Build
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.google.android.gms.tasks.CancellationTokenSource
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import java.io.IOException
import java.util.Locale
import kotlin.coroutines.cancellation.CancellationException
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException

/** Resultado de pedir la ubicación del dispositivo */
sealed interface ResultadoUbicacion {
    /**
     * Se obtuvo la ubicación
     *
     * @property latitud Latitud en grados decimales
     * @property longitud Longitud en grados decimales
     */
    data class Ok(val latitud: Double, val longitud: Double) : ResultadoUbicacion

    /** La app no tiene el permiso de ubicación */
    object SinPermiso : ResultadoUbicacion

    /** No se pudo leer la ubicación: el GPS está apagado o falló la consulta */
    object NoDisponible : ResultadoUbicacion
}

/**
 * Dirección sugerida a partir de unas coordenadas
 *
 * @property municipio Municipio (subAdminArea o, si falta, locality del [Geocoder]), o `null` si no se encontró
 * @property colonia Colonia (subLocality), o `null` si no se encontró
 * @property calle Calle (thoroughfare), o `null` si no se encontró
 */
data class DireccionSugerida(val municipio: String?, val colonia: String?, val calle: String?)

/**
 * Lee la ubicación actual del dispositivo una sola vez, con la mayor precisión disponible
 *
 * Requiere que el permiso ya esté concedido
 *
 * @param context Contexto para obtener el cliente de ubicación
 * @return La ubicación, o [ResultadoUbicacion.SinPermiso] o [ResultadoUbicacion.NoDisponible] si no se pudo leer
 */
@SuppressLint("MissingPermission")
suspend fun obtenerUbicacionActual(context: Context): ResultadoUbicacion = try {
    val cliente = LocationServices.getFusedLocationProviderClient(context)
    val fuente = CancellationTokenSource()

    val ubicacion: Location? = suspendCancellableCoroutine { cont ->
        cont.invokeOnCancellation { fuente.cancel() }
        cliente.getCurrentLocation(Priority.PRIORITY_HIGH_ACCURACY, fuente.token)
            .addOnSuccessListener { cont.resume(it) }
            .addOnFailureListener { cont.resumeWithException(it) }
    }

    if (ubicacion != null) ResultadoUbicacion.Ok(ubicacion.latitude, ubicacion.longitude)
    else ResultadoUbicacion.NoDisponible
} catch (e: SecurityException) {
    ResultadoUbicacion.SinPermiso
} catch (e: CancellationException) {
    throw e
} catch (e: Exception) {
    ResultadoUbicacion.NoDisponible
}

/**
 * Convierte coordenadas en una dirección con el [Geocoder] del sistema
 *
 * @param context Contexto para crear el [Geocoder]
 * @param lat Latitud en grados decimales
 * @param lng Longitud en grados decimales
 * @return La dirección sugerida, o `null` si las coordenadas están fuera de rango, el dispositivo no tiene
 * servicio de geocodificación o falla la consulta
 */
suspend fun direccionDesdeCoordenadas(context: Context, lat: Double, lng: Double): DireccionSugerida? {
    if(lat !in -90.0..90.0 || lng !in -180.0..180.0)return null
    if (!Geocoder.isPresent()) return null
    val geocoder = Geocoder(context, Locale("es", "MX"))
    return try {
        val direccion: Address? = if (Build.VERSION.SDK_INT >= 33) {
            suspendCancellableCoroutine { cont ->
                geocoder.getFromLocation(lat, lng, 1, object : Geocoder.GeocodeListener {
                    override fun onGeocode(addresses: MutableList<Address>) {
                        cont.resume(addresses.firstOrNull())
                    }
                    override fun onError(errorMessage: String?) {
                        cont.resume(null)
                    }
                })
            }
        } else {
            withContext(Dispatchers.IO) {
                @Suppress("DEPRECATION")
                geocoder.getFromLocation(lat, lng, 1)?.firstOrNull()
            }
        }
        direccion?.let {
            DireccionSugerida(
                municipio = it.subAdminArea ?: it.locality,
                colonia = it.subLocality,
                calle = it.thoroughfare
            )
        }
    } catch (e: IOException) {
        null
    }
}