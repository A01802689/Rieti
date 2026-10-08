package mx.itesm.myapplication.data.network

import okhttp3.JavaNetCookieJar
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.net.CookieManager
import java.net.CookiePolicy
import java.util.concurrent.TimeUnit

object ApiClient {

    // 127.0.0.1 con adb reverse en el emulador redirecciona el puerto 8000 directamente a localhost de la PC.
    private const val DEFAULT_BASE_URL = "http://127.0.0.1:8000/"

    private var baseUrl: String = DEFAULT_BASE_URL

    // CookieManager con política ACCEPT_ALL para almacenar y gestionar las cookies del servidor (como access_token)
    val cookieManager: CookieManager by lazy {
        CookieManager().apply {
            setCookiePolicy(CookiePolicy.ACCEPT_ALL)
        }
    }

    private val loggingInterceptor by lazy {
        HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }
    }

    private val okHttpClient: OkHttpClient by lazy {
        OkHttpClient.Builder()
            .cookieJar(JavaNetCookieJar(cookieManager)) // Guarda las cookies (Set-Cookie) y las envía en peticiones posteriores
            .addInterceptor(loggingInterceptor)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()
    }

    private var retrofit: Retrofit? = null

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

    fun setBaseUrl(newUrl: String) {
        baseUrl = if (newUrl.endsWith("/")) newUrl else "$newUrl/"
        retrofit = null // Forzar la recreación de Retrofit con la nueva URL base
    }

    /**
     * Limpia todas las cookies guardadas localmente (por ejemplo, al cerrar sesión manualmente en el cliente)
     */
    fun clearCookies() {
        cookieManager.cookieStore.removeAll()
    }
}
