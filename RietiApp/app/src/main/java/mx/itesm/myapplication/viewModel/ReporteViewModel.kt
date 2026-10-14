package mx.itesm.myapplication.viewModel

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import mx.itesm.myapplication.data.network.ApiClient
import mx.itesm.myapplication.data.network.models.Actividad
import mx.itesm.myapplication.data.network.models.CantidadNna
import mx.itesm.myapplication.data.network.models.RangoEdad
import mx.itesm.myapplication.data.network.models.ReporteCreateRequest
import mx.itesm.myapplication.data.network.models.Riesgo
import mx.itesm.myapplication.data.network.models.UbicacionCreateRequest
import retrofit2.HttpException
import java.io.IOException

/**
 * Representa los estados del envío del reporte a la API.
 */
sealed interface EnvioUiState {
    object Idle : EnvioUiState
    object Loading : EnvioUiState
    data class Success(val folio: String) : EnvioUiState
    data class Error(val message: String) : EnvioUiState
}

/**
 * Estado UI reactivo que contiene la información completa recopilada en los pasos del reporte.
 */
data class ReporteUiState(
    val esAnonimo: Boolean = true,
    //Contacto (solo con seguimiento)
    val nombre: String = "",
    val apellidos: String = "",
    val telefono: String = "",
    //Formulario
    val cantidad: CantidadNna? = null,
    val edad: RangoEdad? = null,
    val actividad: Actividad? = null,
    val riesgo: Riesgo? = null,
    //Ubicacion
    val municipio: String = "",
    val colonia: String = "",
    val calle: String = "",
    val latitud: Double? = null,
    val longitud: Double? = null,
    //Envío
    val descripcion: String = "",
    val envio: EnvioUiState = EnvioUiState.Idle
) {
    /** Nombre, apellidos y teléfono de 10 dígitos capturados. */
    val contactoValido: Boolean
        get() = nombre.isNotBlank() && apellidos.isNotBlank() && telefono.length == 10

    /** Las cuatro preguntas del formulario respondidas. */
    val formularioValido: Boolean
        get() = cantidad != null && edad != null && actividad != null
    val ubicacionValida: Boolean
        get() = latitud != null && longitud != null
    val puedeEnviar: Boolean
        get() = formularioValido && ubicacionValida &&
            (esAnonimo || contactoValido) && envio !is EnvioUiState.Loading
}

/**
 * Convierte el estado de la UI en la petición para el backend.
 *
 * @return La petición, o `null` si faltan datos obligatorios.
 */
fun ReporteUiState.toRequest(): ReporteCreateRequest? {
    val cantidad = cantidad ?: return null
    val edad = edad ?: return null
    val actividad = actividad ?: return null
    val latitud = latitud ?: return null
    val longitud = longitud ?: return null

    val direccion = listOf(calle, colonia, municipio)
        .filter { it.isNotBlank() }
        .joinToString(", ")
        .ifBlank { null }

    return ReporteCreateRequest(
        ubicacion = UbicacionCreateRequest(
            municipio = municipio.trim(),
            colonia = colonia.trim(),
            calle = calle.trim(),
            longitud = longitud,
            latitud = latitud,
            referencia = null
        ),
        cantidadNna = cantidad.etiqueta,
        edadAproximada = edad.etiqueta,
        tipoTrabajo = actividad.etiqueta,
        descripcion = descripcion.ifBlank { null },
        imagenContentType = null,
        conSeguimiento = !esAnonimo
    )
}

/**
 * [ViewModel] que administra el estado y la lógica de negocio para crear,
 * validar y enviar reportes al backend a través del [ApiClient].
 */
class ReporteViewModel : ViewModel() {

    private companion object {
        private const val TAG = "ReporteViewModel"
    }

    private val _uiState = MutableStateFlow(ReporteUiState())

    /** Estado UI reactivo expuesto a las vistas Composable. */
    val uiState: StateFlow<ReporteUiState> = _uiState.asStateFlow()

    /**
     * Actualiza la modalidad del reporte (Anónimo o Con seguimiento).
     */
    fun setEsAnonimo(esAnonimo: Boolean) = _uiState.update { it.copy(esAnonimo = esAnonimo) }

    /**
     * Actualiza los datos de contacto del usuario (en reportes con seguimiento).
     */
    fun setNombre(valor: String) = _uiState.update { it.copy(nombre = valor) }
    fun setApellidos(valor: String) = _uiState.update { it.copy(apellidos = valor) }

    /** Conserva solo dígitos y limita a 10. */
    fun setTelefono(valor: String) =
        _uiState.update { it.copy(telefono = valor.filter(Char::isDigit).take(10)) }

    /**
     * Actualiza las selecciones de categoría del formulario de reporte.
     */
    fun setCantidad(valor: CantidadNna?) = _uiState.update { it.copy(cantidad = valor) }
    fun setEdad(valor: RangoEdad?) = _uiState.update { it.copy(edad = valor) }
    fun setActividad(valor: Actividad?) = _uiState.update { it.copy(actividad = valor) }
    fun setRiesgo(valor: Riesgo?) = _uiState.update { it.copy(riesgo = valor) }

    /**
     * Actualiza los datos de ubicación geográfica o dirección.
     */
    fun setMunicipio(valor: String) = _uiState.update { it.copy(municipio = valor) }
    fun setColonia(valor: String) = _uiState.update { it.copy(colonia = valor) }
    fun setCalle(valor: String) = _uiState.update { it.copy(calle = valor) }

    /** Guarda las coordenadas elegidas en el mapa sin tocar la dirección escrita. */
    fun setCoordenadas(latitud: Double, longitud: Double) =
        _uiState.update { it.copy(latitud = latitud, longitud = longitud) }

    /**
     * Actualiza el texto descriptivo detallado del incidente.
     */
    fun setDescripcion(valor: String) = _uiState.update { it.copy(descripcion = valor) }

    /**
     * Envía la información recopilada del reporte a la API REST backend.
     */
    fun enviarReporte() {
        val state = _uiState.value
        if (!state.puedeEnviar) return
        val request = state.toRequest() ?: return

        _uiState.update { it.copy(envio = EnvioUiState.Loading) }

        viewModelScope.launch {
            try {
                val response = ApiClient.apiService.crearReporte(request)
                val body = response.body()
                if (response.isSuccessful && body != null) {
                    _uiState.update { it.copy(envio = EnvioUiState.Success(body.folioReporte)) }
                } else {
                    Log.e(
                        TAG,
                        "Error en enviarReporte (HTTP ${response.code()}): ${
                            response.errorBody()?.string()
                        }"
                    )
                    val mensaje = when (response.code()) {
                        400, 422 -> "Revisa los datos del reporte e inténtalo de nuevo."
                        401, 403 -> "Tu sesión ha expirado. Inicia sesión nuevamente."
                        500 -> "Error interno del servidor (500). Intenta más tarde o verifica la base de datos."
                        else -> "No se pudo enviar el reporte (${response.code()})."
                    }
                    _uiState.update { it.copy(envio = EnvioUiState.Error(mensaje)) }
                }
            } catch (e: CancellationException) {
                throw e
            } catch (e: HttpException) {
                Log.e(TAG, "HttpException en enviarReporte: ${e.message()}", e)
                _uiState.update { it.copy(envio = EnvioUiState.Error("Error de servidor (${e.code()})")) }
            } catch (e: IOException) {
                Log.e(TAG, "IOException en enviarReporte: ${e.localizedMessage}", e)
                _uiState.update { it.copy(envio = EnvioUiState.Error("Error de conexión. Verifica tu red o servidor.")) }
            } catch (e: Exception) {
                Log.e(TAG, "Excepción en enviarReporte: ${e.localizedMessage}", e)
                _uiState.update { it.copy(envio = EnvioUiState.Error("Ocurrió un error inesperado.")) }
            }
        }
    }

    /**
     * Restablece el estado de envío a [EnvioUiState.Idle].
     */
    fun resetEnvioState() = _uiState.update { it.copy(envio = EnvioUiState.Idle) }

    /**
     * Reinicia completamente el formulario para capturar un nuevo reporte.
     */
    fun resetFormulario() = _uiState.update { ReporteUiState(esAnonimo = it.esAnonimo) }
}
