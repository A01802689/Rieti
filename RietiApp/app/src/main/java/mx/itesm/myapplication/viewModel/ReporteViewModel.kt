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
import mx.itesm.myapplication.data.network.DireccionSugerida
import mx.itesm.myapplication.data.network.FotoReporte
import mx.itesm.myapplication.data.network.SesionUsuario
import mx.itesm.myapplication.data.network.models.Actividad
import mx.itesm.myapplication.data.network.models.CantidadNna
import mx.itesm.myapplication.data.network.models.MunicipioResponse
import mx.itesm.myapplication.data.network.models.RangoEdad
import mx.itesm.myapplication.data.network.models.ReporteCreateRequest
import mx.itesm.myapplication.data.network.models.Riesgo
import mx.itesm.myapplication.data.network.models.UbicacionCreateRequest
import mx.itesm.myapplication.data.network.subirImagen
import org.json.JSONArray
import org.json.JSONObject
import retrofit2.HttpException
import java.io.IOException
import java.text.Normalizer

/** Estados del envío del reporte a la API */
sealed interface EnvioUiState {
    /** Todavía no se envía */
    object Idle : EnvioUiState

    /** Se está creando el reporte en el backend */
    object Loading : EnvioUiState

    /** El reporte ya se creó y se está subiendo la imagen */
    object SubiendoImagen : EnvioUiState

    /**
     * El reporte se creó
     *
     * @property folio Folio del reporte; `null` en reportes anónimos
     * @property fotoPendiente `true` si había foto y no se pudo subir
     */
    data class Success(val folio: String?, val fotoPendiente: Boolean = false) : EnvioUiState

    /**
     * El envío falló
     *
     * @property message Mensaje de error para mostrar al usuario
     */
    data class Error(val message: String) : EnvioUiState
}

/** Estados de la carga de municipios desde el backend */
sealed interface MunicipiosUiState {
    /** Se está pidiendo la lista */
    object Loading : MunicipiosUiState

    /**
     * La lista llegó
     *
     * @property municipios Municipios ordenados por nombre
     */
    data class Success(val municipios: List<MunicipioResponse>) : MunicipiosUiState

    /**
     * No se pudo obtener la lista
     *
     * @property message Mensaje de error para mostrar al usuario
     */
    data class Error(val message: String) : MunicipiosUiState
}

/**
 * Estado de la pantalla que reúne lo capturado en los pasos del reporte
 *
 * @property esAnonimo `true` si el reporte es anónimo; `false` si lleva seguimiento con la cuenta del usuario
 * @property nombre Nombre de contacto, solo con seguimiento
 * @property apellidos Apellidos de contacto, solo con seguimiento
 * @property telefono Teléfono de contacto, solo con seguimiento; solo dígitos, hasta 10
 * @property cantidad Cantidad de NNA elegida, o `null` si no se ha respondido
 * @property edad Rango de edad elegido, o `null` si no se ha respondido
 * @property actividad Actividad observada, o `null` si no se ha respondido
 * @property riesgo Nivel de riesgo elegido, o `null` si no se ha respondido
 * @property municipio Nombre del municipio, vacío si no se ha elegido
 * @property colonia Colonia escrita, vacía si no se ha capturado
 * @property calle Calle escrita, vacía si no se ha capturado
 * @property latitud Latitud elegida en el mapa, o `null` si no se ha elegido un punto
 * @property longitud Longitud elegida en el mapa, o `null` si no se ha elegido un punto
 * @property descripcion Descripción opcional de la situación
 * @property envio Estado del envío del reporte
 * @property foto Foto adjunta ya procesada, o `null` si no hay
 */
data class ReporteUiState(
    val esAnonimo: Boolean = true,
    val nombre: String = "",
    val apellidos: String = "",
    val telefono: String = "",
    val cantidad: CantidadNna? = null,
    val edad: RangoEdad? = null,
    val actividad: Actividad? = null,
    val riesgo: Riesgo? = null,
    val municipio: String = "",
    val colonia: String = "",
    val calle: String = "",
    val latitud: Double? = null,
    val longitud: Double? = null,
    val descripcion: String = "",
    val envio: EnvioUiState = EnvioUiState.Idle,
    val foto: FotoReporte? = null
) {
    /** Nombre, apellidos y teléfono de 10 dígitos capturados */
    val contactoValido: Boolean
        get() = nombre.isNotBlank() && apellidos.isNotBlank() && telefono.length == 10

    /** Las cuatro preguntas del formulario respondidas */
    val formularioValido: Boolean
        get() = cantidad != null && edad != null && actividad != null && riesgo != null

    /** Punto del mapa elegido y municipio, colonia y calle capturados */
    val ubicacionValida: Boolean
        get() = latitud != null && longitud != null && municipio.isNotBlank() && colonia.isNotBlank() && calle.isNotBlank()

    /** Formulario y ubicación completos, contacto válido si hay seguimiento y ningún envío en curso o terminado */
    val puedeEnviar: Boolean
        get() = formularioValido && ubicacionValida &&
            (esAnonimo || contactoValido)
                && envio !is EnvioUiState.Loading && envio !is EnvioUiState.SubiendoImagen && envio !is EnvioUiState.Success
}

/**
 * Convierte el estado de la pantalla en la petición para el backend
 *
 * Los textos vacíos se mandan como `null`; los datos de contacto no forman parte de la petición
 *
 * @receiver Estado de la pantalla con lo capturado
 * @return La petición, o `null` si faltan datos obligatorios
 */
fun ReporteUiState.toRequest(): ReporteCreateRequest? {
    val cantidad = cantidad ?: return null
    val edad = edad ?: return null
    val actividad = actividad ?: return null
    val latitud = latitud ?: return null
    val longitud = longitud ?: return null
    val riesgo = riesgo ?: return null

    val mun = municipio.trim().ifBlank { null }
    val col = colonia.trim().ifBlank { null }
    val cal = calle.trim().ifBlank { null }

    return ReporteCreateRequest(
        ubicacion = UbicacionCreateRequest(
            municipio = mun,
            colonia = col,
            calle = cal,
            longitud = longitud,
            latitud = latitud,
            referencia = null
        ),
        cantidadNna = cantidad.etiqueta,
        edadAproximada = edad.etiqueta,
        tipoTrabajo = actividad.etiqueta,
        descripcion = descripcion.trim().ifBlank { null },
        imagenContentType = if (foto != null) "image/jpeg" else null,
        conSeguimiento = !esAnonimo,
        riesgo = riesgo.etiqueta
    )
}

/** [ViewModel] que guarda lo capturado en los pasos del reporte, carga los municipios y envía el reporte al backend */
class ReporteViewModel : ViewModel() {

    private companion object {
        private const val TAG = "ReporteViewModel"
    }

    private val _uiState = MutableStateFlow(ReporteUiState())

    /** Estado del reporte que observan las pantallas */
    val uiState: StateFlow<ReporteUiState> = _uiState.asStateFlow()

    private val _municipios = MutableStateFlow<MunicipiosUiState>(MunicipiosUiState.Loading)

    /** Estado de la carga de municipios para el selector */
    val municipios: StateFlow<MunicipiosUiState> = _municipios.asStateFlow()

    /**
     * Define el tipo de reporte
     *
     * Con seguimiento, precarga nombre y apellidos desde la sesión solo si están vacíos, para no pisar
     * lo que el usuario haya editado. En anónimo, descarta cualquier dato de contacto
     *
     * @param esAnonimo `true` para un reporte anónimo; `false` para uno con seguimiento
     */
    fun setEsAnonimo(esAnonimo: Boolean) = _uiState.update { estado ->
        if (esAnonimo) {
            estado.copy(esAnonimo = true, nombre = "", apellidos = "", telefono = "")
        } else {
            val usuario = SesionUsuario.usuario
            estado.copy(
                esAnonimo = false,
                nombre = estado.nombre.ifBlank { usuario?.nombre.orEmpty() },
                apellidos = estado.apellidos.ifBlank { usuario?.apellido.orEmpty() }
            )
        }
    }

    /**
     * Guarda el nombre de contacto del reporte con seguimiento
     *
     * @param valor Nombre capturado
     */
    fun setNombre(valor: String) = _uiState.update { it.copy(nombre = valor) }

    /**
     * Guarda los apellidos de contacto del reporte con seguimiento
     *
     * @param valor Apellidos capturados
     */
    fun setApellidos(valor: String) = _uiState.update { it.copy(apellidos = valor) }

    /**
     * Guarda el teléfono de contacto; conserva solo dígitos y limita a 10
     *
     * @param valor Teléfono capturado
     */
    fun setTelefono(valor: String) =
        _uiState.update { it.copy(telefono = valor.filter(Char::isDigit).take(10)) }

    /**
     * Guarda la cantidad de NNA elegida
     *
     * @param valor Opción elegida, o `null` para quitarla
     */
    fun setCantidad(valor: CantidadNna?) = _uiState.update { it.copy(cantidad = valor) }

    /**
     * Guarda el rango de edad elegido
     *
     * @param valor Opción elegida, o `null` para quitarla
     */
    fun setEdad(valor: RangoEdad?) = _uiState.update { it.copy(edad = valor) }

    /**
     * Guarda la actividad observada
     *
     * @param valor Opción elegida, o `null` para quitarla
     */
    fun setActividad(valor: Actividad?) = _uiState.update { it.copy(actividad = valor) }

    /**
     * Guarda el nivel de riesgo elegido
     *
     * @param valor Opción elegida, o `null` para quitarla
     */
    fun setRiesgo(valor: Riesgo?) = _uiState.update { it.copy(riesgo = valor) }

    /**
     * Guarda el municipio
     *
     * @param valor Nombre del municipio
     */
    fun setMunicipio(valor: String) = _uiState.update { it.copy(municipio = valor) }

    /**
     * Guarda la colonia
     *
     * @param valor Colonia capturada
     */
    fun setColonia(valor: String) = _uiState.update { it.copy(colonia = valor) }

    /**
     * Guarda la calle
     *
     * @param valor Calle capturada
     */
    fun setCalle(valor: String) = _uiState.update { it.copy(calle = valor) }

    /**
     * Guarda las coordenadas elegidas en el mapa sin tocar la dirección escrita
     *
     * @param latitud Latitud en grados decimales
     * @param longitud Longitud en grados decimales
     */
    fun setCoordenadas(latitud: Double, longitud: Double) =
        _uiState.update { it.copy(latitud = latitud, longitud = longitud) }

    /**
     * Guarda la descripción de la situación
     *
     * @param valor Texto capturado
     */
    fun setDescripcion(valor: String) = _uiState.update { it.copy(descripcion = valor) }

    /**
     * Guarda la foto adjunta
     *
     * @param foto Foto ya procesada, o `null` para quitarla
     */
    fun setFoto(foto: FotoReporte?) = _uiState.update { it.copy(foto = foto) }

    /**
     * Crea el reporte con `POST /reportes/` y, si hay foto y el backend devolvió URL de subida, la sube
     *
     * No hace nada si [ReporteUiState.puedeEnviar] es `false`. En reportes anónimos no se guarda el folio
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
                    val folio = if (state.esAnonimo) null else body.folioReporte
                    val foto = state.foto
                    val url = body.urlSubidaImagen
                    if (foto != null && url != null) {
                        _uiState.update { it.copy(envio = EnvioUiState.SubiendoImagen) }
                        val subida = subirImagen(url, foto.bytes)
                        if (!subida) Log.w(TAG, "Error al subir la imagen")
                        _uiState.update { it.copy(envio = EnvioUiState.Success(folio, fotoPendiente = !subida)) }
                    } else {
                        _uiState.update { it.copy(envio = EnvioUiState.Success(folio, fotoPendiente = foto != null)) }
                    }
                } else {
                    val rawError = response.errorBody()?.string()
                    Log.e(
                        TAG,
                        "Error en enviarReporte (HTTP ${response.code()}): $rawError"
                    )
                    val mensaje = parsearErrorBackend(rawError, response.code())
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
     * Saca un mensaje legible de la respuesta de error del backend
     *
     * Entiende el `detail` de FastAPI (texto o lista de errores de validación) y los campos `message` y `error`
     *
     * @param rawError Cuerpo de la respuesta de error, si lo hay
     * @param code Código HTTP de la respuesta
     * @return El mensaje del backend, o uno genérico según [code] si el cuerpo viene vacío
     */
    private fun parsearErrorBackend(rawError: String?, code: Int): String {
        if (rawError.isNullOrBlank()) {
            return when (code) {
                400, 422 -> "Revisa los datos del reporte e inténtalo de nuevo."
                401, 403 -> "Tu sesión ha expirado. Inicia sesión nuevamente."
                500 -> "Error interno del servidor (500). Intenta más tarde o verifica la base de datos."
                else -> "No se pudo enviar el reporte ($code)."
            }
        }
        return try {
            val json = JSONObject(rawError)
            when {
                json.has("detail") -> {
                    val detail = json.get("detail")
                    if (detail is JSONArray && detail.length() > 0) {
                        val item = detail.get(0)
                        if (item is JSONObject) {
                            val msg = item.optString("msg", "")
                            val locArray = item.optJSONArray("loc")
                            val field = if (locArray != null && locArray.length() > 0) locArray.optString(locArray.length() - 1) else ""
                            if (field.isNotBlank() && msg.isNotBlank()) "Error en '$field': $msg"
                            else msg.ifBlank { rawError }
                        } else {
                            item.toString()
                        }
                    } else {
                        detail.toString()
                    }
                }
                json.has("message") -> json.getString("message")
                json.has("error") -> json.getString("error")
                else -> rawError
            }
        } catch (e: Exception) {
            rawError
        }
    }

    init {
        cargarMunicipios()
    }

    /** Pide la lista de municipios con `GET /municipios/`; también sirve para reintentar */
    fun cargarMunicipios() {
        _municipios.value = MunicipiosUiState.Loading
        viewModelScope.launch {
            try {
                val response = ApiClient.apiService.obtenerMunicipios()
                val lista = response.body()
                _municipios.value = when {
                    response.isSuccessful && !lista.isNullOrEmpty() ->
                        MunicipiosUiState.Success(lista.sortedBy { it.nombre })
                    response.isSuccessful ->
                        MunicipiosUiState.Error("No hay municipios disponibles.")
                    response.code() == 401 || response.code() == 403 -> {
                        Log.e(TAG, "Municipios sin permiso (HTTP ${response.code()})")
                        MunicipiosUiState.Error("No se pudo cargar la lista de municipios. Inicia sesión de nuevo.")
                    }
                    else -> {
                        Log.e(TAG, "Error al cargar municipios (HTTP ${response.code()})")
                        MunicipiosUiState.Error("No se pudieron cargar los municipios (${response.code()}).")
                    }
                }
            } catch (e: CancellationException) {
                throw e
            } catch (e: IOException) {
                Log.e(TAG, "IOException al cargar municipios: ${e.localizedMessage}", e)
                _municipios.value = MunicipiosUiState.Error("Error de conexión. Verifica tu red o servidor.")
            } catch (e: Exception) {
                Log.e(TAG, "Excepción al cargar municipios: ${e.localizedMessage}", e)
                _municipios.value = MunicipiosUiState.Error("Ocurrió un error inesperado.")
            }
        }
    }

    /**
     * Aplica la dirección sugerida para el punto elegido
     *
     * Calle y colonia se reemplazan por la sugerencia (o quedan vacías si no hay), para no conservar datos
     * del punto anterior. El municipio solo cambia si coincide con alguno de la lista cargada del backend
     *
     * @param sugerida Dirección obtenida de las coordenadas, o `null` si no se pudo obtener
     */
    fun aplicarDireccionSugerida(sugerida: DireccionSugerida?) {
        val lista = (municipios.value as? MunicipiosUiState.Success)?.municipios.orEmpty()
        val buscado = sugerida?.municipio?.normalizado()?.takeIf { it.isNotBlank() }
        val municipioCoincidente = buscado?.let { b ->
            lista.firstOrNull { val n = it.nombre.normalizado(); n == b || n.contains(b) || b.contains(n) }
        }?.nombre

        _uiState.update {
            it.copy(
                calle = sugerida?.calle.orEmpty(),
                colonia = sugerida?.colonia.orEmpty(),
                municipio = municipioCoincidente ?: it.municipio
            )
        }
    }

    /** Minúsculas y sin acentos, para comparar nombres */
    private fun String.normalizado(): String =
        Normalizer.normalize(lowercase().trim(), Normalizer.Form.NFD).replace("\\p{M}+".toRegex(), "")

    /** Regresa el estado del envío a [EnvioUiState.Idle] */
    fun resetEnvioState() = _uiState.update { it.copy(envio = EnvioUiState.Idle) }

    /** Borra todo lo capturado para empezar otro reporte, conservando si es anónimo o con seguimiento */
    fun resetFormulario() = _uiState.update { ReporteUiState(esAnonimo = it.esAnonimo) }
}
