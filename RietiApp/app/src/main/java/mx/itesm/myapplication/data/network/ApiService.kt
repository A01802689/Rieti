package mx.itesm.myapplication.data.network

import mx.itesm.myapplication.data.network.models.ReporteCreateRequest
import mx.itesm.myapplication.data.network.models.ReporteResponse
import mx.itesm.myapplication.data.network.models.UsuarioCreateRequest
import mx.itesm.myapplication.data.network.models.UsuarioLoginRequest
import mx.itesm.myapplication.data.network.models.UsuarioResponse
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

/**
 * Interfaz de Retrofit que define las endpoints del API REST para la aplicación Rieti.
 */
interface ApiService {

    /**
     * Verifica la disponibilidad de la ruta raíz del servidor.
     *
     * @return [Response] conteniendo un mapa de mensaje devuelto por el servidor.
     */
    @GET("/")
    suspend fun checkRoot(): Response<Map<String, String>>

    /**
     * Verifica el estado de salud y funcionamiento del backend.
     *
     * @return [Response] con la confirmación del estado del servicio.
     */
    @GET("health")
    suspend fun healthCheck(): Response<Map<String, String>>

    /**
     * Inicia sesión para un usuario registrado.
     *
     * @param datos Objeto [UsuarioLoginRequest] con el correo y contraseña.
     * @return [Response] con la información del usuario autenticado [UsuarioResponse].
     */
    @POST("usuarios/login")
    suspend fun login(@Body datos: UsuarioLoginRequest): Response<UsuarioResponse>

    /**
     * Registra un nuevo usuario en la plataforma.
     *
     * @param datos Objeto [UsuarioCreateRequest] con los datos de registro del usuario.
     * @return [Response] con la información del usuario creado [UsuarioResponse].
     */
    @POST("usuarios")
    suspend fun crearUsuario(@Body datos: UsuarioCreateRequest): Response<UsuarioResponse>

    /**
     * Cierra la sesión activa del usuario e invalida la cookie de sesión en el servidor.
     *
     * @return [Response] con el mensaje de confirmación de cierre de sesión.
     */
    @POST("usuarios/logout")
    suspend fun logout(): Response<Map<String, String>>

    /**
     * Registra un nuevo reporte en el sistema.
     *
     * @param datos Objeto [ReporteCreateRequest] con los detalles del reporte y ubicación.
     * @return [Response] con los identificadores del reporte creado [ReporteResponse].
     */
    @POST("reportes/")
    suspend fun crearReporte(@Body datos: ReporteCreateRequest): Response<ReporteResponse>
}
