package mx.itesm.myapplication.data.network

import mx.itesm.myapplication.data.network.models.UsuarioResponse
import okhttp3.JavaNetCookieJar
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.net.CookieManager
import java.net.CookiePolicy
import java.util.concurrent.TimeUnit

/**
 * Cliente HTTP Singleton configurado con Retrofit y OkHttp para la comunicación con el API REST backend.
 *
 * Administra la URL base del servicio, el manejo automático de cookies de sesión (`access_token`) mediante
 * [CookieManager] y [JavaNetCookieJar], así como el interceptor de registros HTTP para depuración.
 */
object ApiClient {

    /** URL base por defecto pointing a localhost a través de `adb reverse` en emulador. */
    private const val DEFAULT_BASE_URL = "https://qwnm6keof2iainppzpq4dwooea0viytp.lambda-url.us-east-1.on.aws/"

    private var baseUrl: String = DEFAULT_BASE_URL

    /**
     * Gestor de cookies para almacenar y enviar cookies de sesión HTTP automáticamente entre peticiones.
     */
    val cookieManager: CookieManager by lazy {
        CookieManager().apply {
            setCookiePolicy(CookiePolicy.ACCEPT_ALL)
        }
    }

    /** Interceptor para registrar en Logcat las peticiones y respuestas HTTP. */
    private val loggingInterceptor by lazy {
        HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }
    }

    /** Cliente OkHttp configurado con tiempos de espera, almacenamiento de cookies e interceptor de logs. */
    private val okHttpClient: OkHttpClient by lazy {
        OkHttpClient.Builder()
            .cookieJar(JavaNetCookieJar(cookieManager))
            .addInterceptor(loggingInterceptor)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()
    }

    private var retrofit: Retrofit? = null

    /**
     * Instancia singleton del servicio REST [ApiService] generado por Retrofit.
     */
    val apiService: ApiService
        get() {
            if (retrofit == null) {
                retrofit = Retrofit.Builder()
                    .baseUrl(baseUrl)
                    .client(okHttpClient)
                    .addConverterFactory(GsonConverterFactory.create())
                    .build()
            }
            return retrofit!!.create(ApiService::class.java)
        }

    /**
     * Actualiza la URL base del cliente de red y reinicia la instancia de Retrofit.
     *
     * @param newUrl Nueva dirección IP o dominio para el servicio backend.
     */
    fun setBaseUrl(newUrl: String) {
        baseUrl = if (newUrl.endsWith("/")) newUrl else "$newUrl/"
        retrofit = null
    }

    /**
     * Limpia todas las cookies guardadas localmente (por ejemplo, al cerrar sesión del usuario).
     */
    fun clearCookies() {
        cookieManager.cookieStore.removeAll()
    }
}

object SesionUsuario {
    @Volatile
    var usuario: UsuarioResponse? = null
        private set

    fun establecer(usuario: UsuarioResponse) {this.usuario = usuario}
    fun limpiar() { usuario = null }
}
