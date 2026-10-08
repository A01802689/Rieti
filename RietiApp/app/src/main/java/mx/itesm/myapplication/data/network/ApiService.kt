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

interface ApiService {

    @GET("/")
    suspend fun checkRoot(): Response<Map<String, String>>

    @GET("health")
    suspend fun healthCheck(): Response<Map<String, String>>

    @POST("usuarios/login")
    suspend fun login(@Body datos: UsuarioLoginRequest): Response<UsuarioResponse>

    @POST("usuarios")
    suspend fun crearUsuario(@Body datos: UsuarioCreateRequest): Response<UsuarioResponse>

    @POST("usuarios/logout")
    suspend fun logout(): Response<Map<String, String>>

    @POST("reportes/")
    suspend fun crearReporte(@Body datos: ReporteCreateRequest): Response<ReporteResponse>
}
