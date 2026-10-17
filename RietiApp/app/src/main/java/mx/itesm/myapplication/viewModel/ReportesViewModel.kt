package mx.itesm.myapplication.viewModel

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import mx.itesm.myapplication.data.network.ApiClient
import mx.itesm.myapplication.data.network.models.ReporteListadoResponse
import java.io.IOException
import java.time.LocalDateTime
import java.time.OffsetDateTime
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.time.format.DateTimeParseException
import java.util.Locale
import kotlin.coroutines.cancellation.CancellationException

/** Reporte listo para mostrarse en una tarjeta. */
data class ReporteResumen(
    val idReporte: Int,
    val folio: String,
    val ciudad: String,
    val ubicacion: String,
    val etiquetas: List<String>,
    val estatus: String,
    val fecha: String
)

private val formatoFecha = DateTimeFormatter.ofPattern("d MMM yyyy · HH:mm 'hrs'",
    Locale("es", "MX")
)
private val zona_backend: ZoneId = ZoneId.of("America/Mexico_City")

/** Convierte una fecha ISO-8601 del backend a la hora local del dispositivo. */
fun formatearFecha(iso: String): String {
    val instante = try {
        OffsetDateTime.parse(iso).toInstant()                           // "…Z" o "…-06:00"
    } catch (e: DateTimeParseException) {
        try {
            LocalDateTime.parse(iso).atZone(zona_backend).toInstant()   // sin zona
        } catch (e2: DateTimeParseException) {
            return iso
        }
    }
    return instante.atZone(ZoneId.systemDefault()).format(formatoFecha)
}

fun ReporteListadoResponse.toResumen(): ReporteResumen {
    val actividad = tipoTrabajo?.takeIf { it.isNotBlank() && it != "No sé" } ?: "Actividad no especificada"
    val cantidad = cantidadNna?.takeIf { it != "No sé" }?.let { "$it NNA" } ?: "Cantidad no especificada"
    val edad = edadAproximada?.takeIf { it != "No sé" }?.let { "$it años" }

    return ReporteResumen(
        idReporte = idReporte,
        folio = folioReporte.orEmpty(),
        ciudad = ubicacion?.municipio.orEmpty(),
        ubicacion = listOfNotNull(ubicacion?.calle, ubicacion?.colonia)
            .filter { it.isNotBlank() }
            .joinToString(", "),
        etiquetas = listOf(actividad, listOfNotNull(cantidad, edad).joinToString(" · ")),
        estatus = estatusSeguimiento.orEmpty(),
        fecha = fechaReporte?.let(::formatearFecha).orEmpty()
    )
}

/** Estado de "Mis reportes". [reportes] es `null` mientras no se haya cargado nunca. */
data class ReportesUiState(
    val cargando: Boolean = false,
    val reportes: List<ReporteResumen>? = null,
    val error: String? = null
)

/** Carga desde el backend los reportes con seguimiento del usuario con sesión. */
class ReportesViewModel : ViewModel() {

    private companion object { private const val TAG = "ReportesViewModel" }

    private val _uiState = MutableStateFlow(ReportesUiState())
    val uiState: StateFlow<ReportesUiState> = _uiState.asStateFlow()

    private var trabajo: Job? = null

    /** Pide la lista. Si ya había una, se conserva en pantalla mientras llega la nueva. */
    fun cargar() {
        trabajo?.cancel() // evita que una respuesta vieja pise a una más reciente
        trabajo = viewModelScope.launch {
            _uiState.update { it.copy(cargando = true, error = null) }
            try {
                val response = ApiClient.apiService.obtenerMisReportes()
                val cuerpo = response.body()
                if (response.isSuccessful && cuerpo != null) {
                    val lista = cuerpo.sortedByDescending { it.idReporte }.map { it.toResumen() }
                    _uiState.update { it.copy(cargando = false, reportes = lista) }
                } else {
                    Log.e(TAG, "Error al cargar reportes (HTTP ${response.code()})")
                    val mensaje = when (response.code()) {
                        401 -> "Tu sesión expiró. Inicia sesión de nuevo."
                        403 -> "Tu cuenta no tiene los permisos necesarios."
                        500 -> "Error interno del servidor (500). Intenta más tarde."
                        else -> "No se pudieron cargar tus reportes (${response.code()})."
                    }
                    _uiState.update { it.copy(cargando = false, error = mensaje) }
                }
            } catch (e: CancellationException) {
                throw e
            } catch (e: IOException) {
                Log.e(TAG, "IOException al cargar reportes: ${e.localizedMessage}", e)
                _uiState.update { it.copy(cargando = false, error = "Error de conexión. Verifica tu red o servidor.") }
            } catch (e: Exception) {
                Log.e(TAG, "Excepción al cargar reportes: ${e.localizedMessage}", e)
                _uiState.update { it.copy(cargando = false, error = "Ocurrió un error inesperado.") }
            }
        }
    }
}